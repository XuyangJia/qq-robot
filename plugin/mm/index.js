import { getCos } from './service.js'
const WHITE_LIST = ['MN', 'MM', 'MZ', '美女', '妹妹', '妹子']
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
        ...(await getCos()),
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getCos(),
    })
    return
  }
}