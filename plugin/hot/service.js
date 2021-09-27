import fetch from 'node-fetch'
import { db } from '../../db/index.js'

const detailCache = new Map()
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'

async function initDatabase() {
  const has = await db.schema.hasTable('message')
  if (has) return
  console.log('开始初始化数据库')
  await db.schema.createTable('message', table => {
    table.increments('id').primary()
    table.integer('group_id').index()
    table.integer('user_id').index()
    table.integer('message_id').unique()
    table.text('message')
    table.text('word')
    table.integer('time')
  })
  console.log('[message]', '初始化数据库完毕')
}

async function saveMessage(data, options) {
  const { group_id, user_id, message_id, message, time } = data;
  const word = message
  const [ id ] = await db('message').insert({ group_id, user_id, message_id, message, time, word })
  return id
}

export async function getWordCloud(group_id, options) {
  await initDatabase()
  
}