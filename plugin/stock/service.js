import fetch from 'node-fetch'
import { stringify } from 'qs'
import { db } from '../../db/index.js'

async function queryStock(keyword) {
  const searchapi = `https://searchapi.eastmoney.com/bussiness/web/QuotationLabelSearch?keyword=${keyword}&type=0&pi=1&ps=30&token=32A8A21716361A5A387B0D85259A0037`
  const response = await fetch(searchapi)
  const { Data } = await response.json()
  if (!Data) return `未找到与 ${keyword} 相关的赌场`
  // Type 1 AB股 2 指数 3 板块 4 港股 5 美股 8 基金
  return Data.filter(({ Type }) => [1, 2, 3, 4, 5, 8].includes(Type)).map(({ Name, Datas }) => {
    return `${Name}\n` + Datas.map(({Code, Name}) => `${Name} [ ${Code} ]`).join('\n')
  }).join('\n\n')
}

async function getDetail(code) {
  const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=0.${code}&invt=2&fltt=2&fields=f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f193,f196,f194,f195,f197,f80,f280,f281,f282,f284,f285,f286,f287,f292`)
  const { data } = await response.json()
  if (data) return data
}

async function addBoard(user_id, code) {
  const { f58: name } = await getDetail(code)
  const [{ has }] = await db('stock')
  .where({ user_id, code })
  .count('id as has')
  if (has) return '已存在该赌场'
  await db('stock').insert({
    user_id,
    code,
    name,
    created_at: new Date(),
  })
  return ['赌场添加成功', `${name} ${code}`].join('\n')
}

async function removeBoard(user_id, code) {
  const effectCount = await db('stock')
    .where({
      user_id,
      code: code,
    })
    .del()
  if (!effectCount) return '删除赌场失败'
  return '删除赌场成功'
}

async function getList(user_id) {
  const list = await Promise.all(
    (await db('stock').column('code').where('user_id', user_id)).map(stock => stock.code)
  )
  if (!list.length) return '您还不是韭菜, 快来添加股票吧\n 添加：GP add 赌场代码\n 删除：GP del 赌场代码'
  const dataList = await Promise.all(list.map(getDetail))
  return '赌场名称    赌场代码    涨跌幅\n'
  + dataList.map(obj => {
    return [obj['f58'], obj['f57'], `  ${obj['f170']}%`].join('    ')
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
  let text
  console.log(user_id, operator, code)
  switch (operator) {
    case 'ADD':
      text = await addBoard(user_id, code)
      break;
    case 'DEL':
      text = await removeBoard(user_id, code)
      break;
    case '>':
      break;
    default: // 查询自己添加的赌场
      text = operator ? await queryStock(operator) : await getList(user_id)
      break;
  }
  return [ { type: 'text', data: { text } } ]
}