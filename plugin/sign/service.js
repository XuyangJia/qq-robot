import fetch from 'node-fetch'
import { db } from '../../db/index.js'
const tableName = 'user'

async function signed(qq, addCoin, coin, sign_times) {
  const text = `签到成功！，增加${addCoin}机器币。你目前共有${coin}机器币，你已经累计签到${sign_times}天。`
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
          qq,
          "name": "昵称获取失败"
      }
    },
    {
      type: 'text',
      data: { text }
    }
  ]
}

async function failed(qq) {
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
          qq,
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

function isToDay(timeStamp) {
  const date = new Date(timeStamp)
  const today = new Date()
  return date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)
}

function randomCoin() {
  return Math.floor(Math.random() * 15 + 5)
}

export async function signIn(data) {
  const { user_id:qq, sender } = data
  const nickname = sender.card || sender.nickname
  const addCoin = randomCoin()
  const [{ has }] = await db(tableName)
  .where({ qq })
  .count('id as has')
  if (has) {
    // 检测上次签到时间
    const [{ sign_at, coin = 0, sign_times = 0 }] = await db(tableName).column('sign_at', 'coin', 'sign_times').where({ qq })
    if (isToDay(sign_at)) {
      return failed(qq)
    } else {
      await db(tableName)
      .where({ qq })
      .update({ coin: coin + addCoin, sign_times: sign_times + 1 , sign_at: new Date })
      return signed(qq, addCoin, coin + addCoin, sign_times + 1)
    }
  } else {
    await db(tableName).insert({
      qq,
      password: String(qq),
      nickname,
      coin: addCoin,
      sign_times: 1,
      sign_at: new Date,
    })
    return signed(qq, addCoin, addCoin, 1)
  }
}