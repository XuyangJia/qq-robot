import { createHash } from 'crypto'
import fetch from 'node-fetch'
import { stringify } from 'qs'


export async function translate(q) {
  const apiPath = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
  const appid = '20211015000973876'
  const secretKey = 'wvLZ3xK1wKiTFIpbWo5M'
  const from = 'auto'
  const to = 'en'
  const salt = String(Date.now())
  const sign = createHash('md5').update(`${appid}${q}${salt}${secretKey}`).digest("hex")
  const params = { q, from, to, appid, salt, sign}
  const response = await fetch(`${apiPath}?${stringify(params)}`)
  let text
  const { trans_result, error_msg } = await response.json()
  if (error_msg) text = error_msg
  else {
    const [{ dst }] = trans_result
    text = `${dst}\nfrom fanyi.baidu.com`
  }
  return [
    {
      type: 'text',
      data: { text }
    }
  ]
}