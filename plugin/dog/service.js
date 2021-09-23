import fetch from 'node-fetch'

export async function getDog() {
  try {
    const response = await fetch('https://api.oick.cn/dog/api.php')
    const data = await response.text()
    return [
      {
        type: 'text',
        data: {
          text: data
        }
      }
    ]
  } catch (e) {
    console.error('[dog]', e)
    return [
      {
        type: 'text',
        data: {
          text: '舔不动了'
        }
      }
    ]
  }
}