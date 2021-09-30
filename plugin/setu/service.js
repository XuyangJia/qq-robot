import fetch from 'node-fetch'
import { stringify } from 'qs'
const api = 'https://api.lolicon.app/setu/v2'

async function getPic(tag) {
  const r18 = tag === '18' ? 0 : 0
  const params = { r18 }
  if (!r18) params.tag = tag
  const response = await fetch(`${api}?${stringify(params)}`)
  const { data: [{ title, author, uploadDate, urls: { original } }]} = await response.json()
  return {
    text: `${title}\n作者：${author}\n上传日期：${(new Date(uploadDate)).toLocaleDateString()}`,
    file: original
  }
}

export async function getCos(tag) {
  try {
    const { text, file } = await getPic(tag)
    return [
      {
        type: 'text',
        data: { text }
      },
      {
        type: 'image',
        data: { file }
      }
    ]
  } catch (e) {
    console.error('[mm]', e)
    return [
      {
        type: 'text',
        data: { text: '注意身体，多保重啊' }
      }
    ]
  }
}