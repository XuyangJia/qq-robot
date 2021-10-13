import fetch from 'node-fetch'

const publicPath = 'https://cdn.jsdelivr.net/gh/ipchi9012/cos_pics@latest/'

async function getRandom(jsPath) {
  const response = await fetch(jsPath)
  const text = await response.text()
  const arr = JSON.parse(text.match(/.+\((.*)\)/)[1])
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function getCos(user_id) {
  let result
  try {
    const cos_index = await getRandom(`${publicPath}cos_index.js`)
    const item = await getRandom(`${publicPath}${cos_index}.js`)
    const file = publicPath + item.path
    result = [
      {
        type: 'text',
        data: { text: `\n${item.category} - ${item.suite}` }
      },
      {
        type: 'image',
        data: {
          file
        }
      }
    ]
  } catch (e) {
    console.error('[mm]', e)
    result = [
      {
        type: 'text',
        data: { text: '美女走丢了' }
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