import fetch from 'node-fetch'

export async function getWallPaper(user_id, fl) {
  let result
  try {
    const api = fl === 'cos' ? 'https://imgapi.cn/cos.php?return=json' : `https://imgapi.cn/api.php?fl=${fl}&gs=json`
    const response = await fetch(api)
    const { imgurl: file } = await response.json()
    result = [
      {
        type: 'image',
        data: { file }
      }
    ]
  } catch (e) {
    console.error('[wallpaper]', e)
    result = [
      {
        type: 'text',
        data: { text: '壁纸丢失' }
      }
    ]
  }
  result.push({
    "type": "at",
    "data": {
        "qq": user_id,
        "name": "昵称获取失败"
    }
  })
  return result
}