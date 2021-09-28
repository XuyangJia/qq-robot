import fetch from 'node-fetch'
import { stringify } from 'qs'
import { db } from '../../db/index.js'

const eastmoneyApi = 'https://2.push2.eastmoney.com/api/qt/clist/get'
const params = {
  pn: 1,
  pz: 20, // 获取数量
  po: 1,
  np: 1,
  fltt: 2,
  fid: 'f3',
  fs: 'm:90+t:1+f:!50', // t: 1 地域 2 行业 3 概念
  fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105,f140,f141,f207,f208,f209,f222',
}

async function getBoardRank(t, pz) {
  const query = stringify(Object.assign({}, params, { pz, fs: `m:90+t:${t}+f:!50`}))
  const response = await fetch(`${eastmoneyApi}?${query}`)
  const { data: { diff } } = await response.json()
  
  const result = diff.map((obj, index) => {
    return [index + 1, obj['f12'], obj['f14'], obj['f3']].join('   ')
  }).join('\n')
  
  const { name, key } = {
    1: { name: '地域板块', key: 'region_board' },
    2: { name: '行业板块', key: 'industry_board' },
    3: { name: '概念板块', key: 'concept_board' },
  }[t]
  return `====  ${name}  ====\n${result}\nhttp://quote.eastmoney.com/center/boardlist.html#${key}`
}

async function getDetail(code) {
  const response = await fetch(`http://push2.eastmoney.com/api/qt/stock/get?secid=90.${code}&fields=f57,f58,f59,f152,f43,f169,f170,f46,f60,f44,f45,f168,f50,f47,f48,f49,f46,f169,f161,f117,f85,f47,f48,f163,f171,f113,f114,f115,f86,f117,f85`)
  const { data } = await response.json()
  if (data) return data
}

async function addBoard(user_id, code) {
  const { f58: name } = await getDetail(code)
  const [{ has }] = await db('board')
  .where({ user_id, code })
  .count('id as has')
  if (has) return '已存在该板块'
  await db('board').insert({
    user_id,
    code,
    name,
    created_at: new Date(),
  })
  return ['添加板块成功', `${name} ${code}`].join('\n')
}

async function removeBoard(user_id, code) {
  const effectCount = await db('board')
    .where({
      user_id,
      code: code,
    })
    .del()
  if (!effectCount) return '删除板块失败'
  return '删除板块成功'
}

async function filterBoard(t, range = 1) {
  const pz = 100
  const query = stringify(Object.assign({}, params, { pz, fs: `m:90+t:${t}+f:!50`}))
  const response = await fetch(`${eastmoneyApi}?${query}`)
  const { data: { diff } } = await response.json()
  const result = diff.filter(obj => obj['f3'] >= range).map((obj, index) => {
    return [index + 1, obj['f12'], obj['f14'], obj['f3']].join('   ')
  }).join('\n')
  
  const { name, key } = {
    1: { name: '地域板块', key: 'region_board' },
    2: { name: '行业板块', key: 'industry_board' },
    3: { name: '概念板块', key: 'concept_board' },
  }[t]
  return `====  ${name}  ====\n${result}\nhttp://quote.eastmoney.com/center/boardlist.html#${key}`
}

async function getBoardList(user_id) {
  const list = await Promise.all(
    (await db('board').column('code').where('user_id', user_id)).map(board => board.code)
  )
  if (!list.length) return '您还不是韭菜, 快来添加股票吧\n 查询：BK 数字\n 添加：BK add 板块代码\n 删除：BK del 板块代码'
  const dataList = await Promise.all(list.map(getDetail))
  return '板块名称    板块代码    涨跌幅\n'
  + dataList.map(obj => {
    return [obj['f58'], obj['f57'], `  ${obj['f170'] / 100}%`].join('    ')
  }).join('\n')
}

async function initDatabase() {
  const has = await db.schema.hasTable('board')
  if (has) return
  console.log('开始初始化数据库')
  await db.schema.createTable('board', table => {
    table.increments('id').primary()
    table.integer('user_id').index()
    table.string('code')
    table.string('name')
    table.dateTime('created_at')
  })
  console.log('[board]', '初始化数据库完毕')
}

export async function manageBoard(user_id, operator, code) {
  await initDatabase()
  let text
  if (Number.isInteger(parseInt(operator))) {
    // 列出行业板块和概念板块的前10
    const pz = parseInt(operator)
    text = `${await getBoardRank(2, pz)}\n${await getBoardRank(3, pz)}`
    return [ { type: 'text', data: { text } } ]
  }
  switch (operator) {
    case 'ADD':
      text = await addBoard(user_id, code)
      break;
    case 'DEL':
      text = await removeBoard(user_id, code)
      break;
    case '>':
      text = `${await filterBoard(2, code)}\n${await filterBoard(3, code)}`
      break;
    default: // 查询自己添加的板块
      text = await getBoardList(user_id, code)
      break;
  }
  return [ { type: 'text', data: { text } } ]
}