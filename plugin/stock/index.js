import { getStock } from './service.js'
const pattern = /^(GP|股票\s+)/i
export async function handler({data, ws, http}) {
  if (!data.message) return
  let message = data.message.toUpperCase().trim()
  if (!pattern.test(message)) return
  message = message.replace(pattern, '').trim()
  if (data.message_type === 'group') {
    ws.send('send_group_msg', {
      group_id: data.group_id,
      message: [
        {
          type: 'reply',
          data: {
            id: data.message_id,
          },
        },
        ...(await getStock(message)),
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getStock(message),
    })
    return
  }
}