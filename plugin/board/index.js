import { getBoard } from './service.js'
const WHITE_LIST = ['板块', 'BK']
export async function handler({data, ws, http}) {
  if (!data.message) return
  const [key = '', pz = 5] = data.message.toUpperCase().trim().split(/\s+/)
  if (!WHITE_LIST.includes(key)) return
  const message = await getBoard(data.user_id, pz)
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
        ...message,
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message,
    })
    return
  }
}