import { createHash } from 'crypto'
import fetch from 'node-fetch'
import { stringify } from 'qs'
import { urls } from './urls.js'

// https://hefollo.com/%E5%B0%8F%E5%A7%90%E5%A7%90%E8%A7%86%E9%A2%91/
export async function getVideo(user_id) {
  const file = `https://hefollo.com/小姐姐视频/${urls[Math.floor(Math.random() * urls.length)]}`
  console.log(file)
  return [
    {
      type: 'text',
      data: { text: file }
    },
    {
      "type": "video",
      "data": { file }
    },
    {
      "type": "at",
      "data": {
          "qq": user_id,
          "name": "昵称获取失败"
      }
    }
  ]
}