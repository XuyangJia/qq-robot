import fetch from 'node-fetch'

export async function getWallPaper(user_id, fl) {
  let result
  const api = fl === 'cos' ? 'https://imgapi.cn/cos.php?return=json' : `https://imgapi.cn/api.php?fl=${fl}&gs=json`
  const response = await fetch(api)
  const { imgurl: file } = await response.json()
  if (file) {
    result = [
      {
        type: 'text',
        data: { text: file }
      },
      {
        type: 'image',
        data: { file }
      }
    ]
  } else {
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