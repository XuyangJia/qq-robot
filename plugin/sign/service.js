import fetch from 'node-fetch'
import { db } from '../../db/index.js'

async function initDatabase() {
  const has = await db.schema.hasTable('bank')
  if (has) return
  console.log('开始初始化数据库')
  await db.schema.createTable('bank', table => {
    table.increments('id').primary()
    table.integer('user_id').index()
    table.string('nickname')
    table.integer('coin')
    table.integer('times')
    table.dateTime('sign_at')
  })
  console.log('[bank]', '初始化数据库完毕')
}

async function signed(user_id, addCoin, coin, times) {
  const text = `签到成功！，增加${addCoin}机器币。你目前共有${coin}机器币，你已经累计签到${times}天。`
  const response = await fetch('https://imgapi.cn/api.php?fl=meizi&gs=json')
  const { imgurl: file } = await response.json()
  return [
    {
      type: 'image',
      data: { file }
    },
    {
      "type": "at",
      "data": {
          "qq": user_id,
          "name": "昵称获取失败"
      }
    },
    {
      type: 'text',
      data: { text }
    }
  ]
}

async function failed(user_id) {
  const words = [
    '签过了就别签了',
    '机器猫也是会生气的哦',
    '哎呀，你烦不烦啊',
    '重复签到并不会再次得到机器币',
    '连续签到刷屏，会有惩罚的哦。',
  ]
  return [
    {
      "type": "at",
      "data": {
          "qq": user_id,
          "name": "昵称获取失败"
      }
    },
    {
      type: 'text',
      data: {
        text: words[Math.floor(Math.random() * words.length)],
      },
    },
  ]
}

function isSameDay(timeStampA, timeStampB) {
  const dateA = new Date(timeStampA)
  const dateB = new Date(timeStampB)
  return dateA.setHours(0, 0, 0, 0) === dateB.setHours(0, 0, 0, 0)
}

function randomCoin() {
  return Math.floor(Math.random() * 15 + 5)
}

export async function signIn(data) {
  await initDatabase()
  const {user_id, sender} = data
  const nickname = sender.card || sender.nickname
  const now = Date.now()
  const addCoin = randomCoin()
  const [{ has }] = await db('bank')
  .where({ user_id })
  .count('id as has')
  if (has) {
    // 检测上次签到时间
    const [{ sign_at, coin = 0, times = 0 }] = await db('bank').column('sign_at', 'coin', 'times').where({ user_id })
    if (isSameDay(sign_at, now)) {
      return failed(user_id)
    } else {
      await db('bank')
      .where({ user_id })
      .update({ coin: coin + addCoin, times: times + 1 , sign_at: now})
      return signed(user_id, addCoin, coin + addCoin, times + 1)
    }
  } else {
    await db('bank').insert({
      user_id,
      nickname,
      coin: addCoin,
      times: 1,
      sign_at: now,
    })
    return signed(user_id, addCoin, addCoin, 1)
  }
}