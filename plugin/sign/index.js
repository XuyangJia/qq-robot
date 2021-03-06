import { signIn } from './service.js'
const WHITE_LIST = ['签到', '打卡']
export async function handler({data, ws, http}) {
  if (!data.message) return
  const message = data.message.toUpperCase().trim()
  if (!WHITE_LIST.includes(message)) return
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
        ...(await signIn(data)),
      ],
    })
    return
  }
}