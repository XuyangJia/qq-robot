import fetch from 'node-fetch'

const cache = {}
export async function getDetail(api) {
  api += `?t=${(new Date).toLocaleDateString()}`
  let text = cache[api]
  if (!text) {
    const response = await fetch(api)
    const data = await response.json()
    cache[api] = text = data.tts
  }
  return [
    {
      type: 'text',
      data: { text }
    }
  ]
}