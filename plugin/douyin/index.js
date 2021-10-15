import { getVideo } from './service.js'
const WHITE_LIST = ['抖音']
export async function handler({data, ws, http}) {
  if (!data.message) return
  const [key, query] = data.message.toUpperCase().trim().split(/\s+/)
  if (!WHITE_LIST.includes(key)) return
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
        ...(await getVideo(data.user_id)),
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getVideo(data.user_id),
    })
    return
  }
}