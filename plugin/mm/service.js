import fetch from 'node-fetch'

const publicPath = 'https://cdn.jsdelivr.net/gh/ipchi9012/cos_pics@latest/'

async function getRandom(jsPath) {
  const response = await fetch(jsPath)
  const text = await response.text()
  const arr = JSON.parse(text.match(/cos_\w{4,5}\((.*)\)/)[1])
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function getCos() {
  try {
    const cos_index = await getRandom(`${publicPath}cos_index.js`)
    const item = await getRandom(`${publicPath}${cos_index}.js`)
    const file = publicPath + item.path
    return [
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
    return [
      {
        type: 'text',
        data: { text: '妹妹走丢了' }
      }
    ]
  }
}