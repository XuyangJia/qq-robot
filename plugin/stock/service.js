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
    const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287,f292`)
    const { data } = await response.json()
    if (data) return data
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