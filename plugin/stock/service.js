import fetch from 'node-fetch'
import { db } from '../../db/index.js'

async function searchStock(keyword) {
  const searchapi = `https://searchapi.eastmoney.com/bussiness/web/QuotationLabelSearch?keyword=${keyword}&type=0&pi=1&ps=30&token=32A8A21716361A5A387B0D85259A0037`
  const response = await fetch(searchapi)
  const { Data } = await response.json()
  if (!Data) return []
  // Type 1 AB股 2 指数 3 板块 4 港股 5 美股 8 基金
  return Data.filter(({ Type }) => Type === 1)
}

async function queryStock(keyword) {
  const Data = await searchStock(keyword)
  if (!Data.length) return `未找到与 ${keyword} 相关的股票`
  let text = '股票名称    股票代码    最新价    涨跌幅\n'
  const [ { Datas } ] = Data
  if (Datas.length === 1) {
    const [{ Code, Name }] = Datas
    const obj = await getDetail(Code)
    text += [Name, Code, obj['f43'], `  ${obj['f170']}%`].join('    ')
  } else {
    for (let j = 0; j < Datas.length; j++) {
      const { Code, Name } = Datas[j]
      const obj = await getDetail(Code)
      text += [Name, Code, obj['f43'], `  ${obj['f170']}%\n`].join('    ')
    }
  }
  return text
}

export async function getDetail(code) {
  // 0: 深证A股  1: 上证A股  116: 港股  153: 美股
  const secids = [`0.${code}`, `1.${code}`, `116.${code}`, `153.${code}`]
  for (let j = 0; j < secids.length; j++) {
    const secid = secids[j];
    try {
      const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&invt=2&fltt=2&fields=f43,f57,f58,f170`)
      const { data } = await response.json()
      if (data) return data
    } catch (e) {
      console.log(e)
      return null
    }
  }
  return null
}

export async function getCode(keyword) {
  const stocks = await searchStock(keyword)
  // 先查找完全匹配的
  let data = stocks
  .map(({ Datas }) => Datas)
  .flat()
  .find(({Code, Name}) => Code === keyword || Name === keyword)
  
  // 查找只有一个股票的
  data = data || stocks
  .filter(({ Type, Count }) => Type === 1 && Count === 1 )
  .map(({ Datas }) => Datas)
  .flat()[0]
  
  if (data) {
    const { Code, Name } = data
    return { code: Code, name: Name }
  }
  return {}
}

async function addStock(user_id, keyword) {
  const { code, name } = await getCode(keyword)
  if (code) {
    const [{ has }] = await db('stock')
    .where({ user_id, code })
    .count('id as has')
    if (has) return '已存在该股票'
    await db('stock').insert({
      user_id,
      code,
      name,
      created_at: new Date(),
    })
    return ['股票添加成功', `${name} ${code}`].join('\n')
  } else {
    return ['股票添加失败', `${keyword}`].join('\n')
  }
}

async function delStock(user_id, keyword) {
  const { code, name } = await getCode(keyword)
  if (code) {
    const effectCount = await db('stock')
      .where({
        user_id,
        code: code,
      })
      .del()
    if (effectCount) return ['股票删除成功', `${name} ${code}`].join('\n')
  }
  return ['股票删除失败, 请使用代码删除 eg: gp del 600519', `${keyword}`].join('\n')
}

async function getList(user_id) {
  const list = await Promise.all(
    (await db('stock').column('code').where('user_id', user_id)).map(stock => stock.code)
  )
  if (!list.length) return `
  您还不是韭菜, 请使用以下命令进行操作:
  查询: GP/股票 名称/代码
  添加: GP/股票 add 名称/代码
  删除: GP/股票 del 名称/代码
  查询已添加: GP/股票
  `
  const dataList = await Promise.all(list.map(getDetail))
  return '股票代码    股票名称    最新价    涨跌幅\n'
  + dataList.map(({ f57, f58, f43, f170 }) => {
    return [f57, f58, f43, `  ${f170}%`].join('    ')
  }).join('\n')
}

async function initDatabase() {
  const has = await db.schema.hasTable('stock')
  if (has) return
  console.log('开始初始化数据库')
  await db.schema.createTable('stock', table => {
    table.increments('id').primary()
    table.integer('user_id').index()
    table.string('code')
    table.string('name')
    table.dateTime('created_at')
  })
  console.log('[stock]', '初始化数据库完毕')
}

export async function manageStock(user_id, operator, code) {
  await initDatabase()
  switch (operator) {
    case 'ADD':
      return await addStock(user_id, code)
    case 'DEL':
      return await delStock(user_id, code)
    case '>':
      return '功能暂未实现'
    default: // 查询自己添加的股票
      return operator ? await queryStock(operator) : await getList(user_id)
  }
}