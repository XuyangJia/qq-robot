import { manageWatch, queryStock } from './service.js'
const WHITE_LIST = [['股票', 'GP'], ['监控', 'JK']]

export async function handler({data, ws, http}) {
  if (!data.message) return
  const [key = '', ...args] = data.message.toUpperCase().trim().split(/\s+/)
  const i = WHITE_LIST.findIndex(arr => arr.includes(key))
  if (i === -1) return
  const handler = [queryStock, manageWatch][i]
  const { message_type, user_id, group_id = 909056743 } = data
  const text = await handler(user_id, ...args)
  const message = [ { type: 'text', data: { text } } ]
  if (data.message_type === 'group') {
    message.unshift({ type: 'reply', data: { id: data.message_id } })
  }
  const params = { message_type, user_id, group_id, message }
  ws.send('send_msg', params)
}

export { tick } from './service.js'