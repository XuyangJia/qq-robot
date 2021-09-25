import { resolve } from 'path'
import fetch from 'node-fetch'
import knex from 'knex'
import { getCenter } from './util.js'

const detailCache = new Map()
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'
const filename = resolve(process.cwd(), 'db.sqlite')
const db = knex({
  client: 'sqlite3',
  connection: { filename },
  useNullAsDefault: true,
})

async function initDatabase() {
  console.log('开始初始化数据库')
  await db.schema.createTable('fund', table => {
    table.increments('id').primary()
    table.integer('user_id').index()
    table.string('fund_code')
    table.dateTime('created_at')
  })
  console.log('[fund]', '初始化数据库完毕')
}

async function getFundDetail(code) {
  try {
    const cache = detailCache.get(code)
    if (cache && Date.now() - cache.time < 1000 * 60) {
      return cache.data
    }
    
    const response = await fetch(`http://fundgz.1234567.com.cn/js/${code}.js`,{
      timeout: 5000,
      headers: { 'User-Agent': USER_AGENT }
    })
    let data = await response.text()
    data = getCenter(data, 'jsonpgz(', ');')
    if (!data) return null
    data = JSON.parse(data)
    if (new Date() - new Date(data.jzrq) > 1000 * 60 * 60 * 24 * 14) {
      return null
    }
    
    detailCache.set(code, { time: Date.now(), data })
    return data
  } catch (e) {
    console.log(`http://fundgz.1234567.com.cn/js/${code}.js`)
    console.error('[fund]', e)
    return null
  }
}

async function addFund(user_id, code) {
  const detail = await getFundDetail(code)
  if (!detail) {
    return [
      {
        type: 'text',
        data: {
          text: '添加基金失败, 请去天天基金网查询 https://fund.eastmoney.com/',
        },
      },
    ]
  }
  const [{ has }] = await db('fund')
  .where({
    user_id,
    fund_code: code,
  })
  .count('id as has')
  if (has) {
    return [
      {
        type: 'text',
        data: {
          text: '已存在该基金',
        },
      },
    ]
  }
  console.log(code)
  await db('fund').insert({
    user_id,
    fund_code: code,
    created_at: new Date(),
  })
  return [
    {
      type: 'text',
      data: {
        text: ['添加基金成功', formatFund(detail)].join('\n'),
      },
    },
  ]
}

async function removeFund(user_id, code) {
  const effectCount = await db('fund')
    .where({
      user_id,
      fund_code: code,
    })
    .del()
  if (!effectCount) {
    return [
      {
        type: 'text',
        data: {
          text: '删除基金失败',
        },
      },
    ]
  }
  return [
    {
      type: 'text',
      data: {
        text: '删除基金成功',
      },
    },
  ]
}

async function getFundList(user_id) {
  const list = await Promise.all(
    (await db('fund').column('fund_code').where('user_id', user_id))
      .map(chives => chives.fund_code)
      .map(getFundDetail)
  )
  list.sort((a, b) => b.gszzl - a.gszzl)
  return [
    {
      type: 'text',
      data: {
        text: list.map(formatFund).join('\n') || '您还不是韭菜, 快来添加基金吧\n韭菜/JC/暴富/BF 添加/ADD/删除/DEL 基金代码',
      },
    },
  ]
}

function formatFund(item) {
  return `${item.fundcode} ${item.gszzl > 0 ? '+' : ''}${item.gszzl} ${
    item.name
  }`
}

export async function manageFund(user_id, operator, code) {
  console.log('---------------------')
  console.log(user_id, operator, code)
  // await initDatabase()
  if (!code) return await getFundList(user_id)
  if (['ADD', '加', '+'].includes(operator.toUpperCase())) {
    return await addFund(user_id, code)
  }

  if (['DEL', '删', '-'].includes(operator.toUpperCase())) {
    return await removeFund(user_id, code)
  }
}