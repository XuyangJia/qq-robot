import { getDetail } from './service.js'
const WHITE_LIST = ['TIPS']
export async function handler({data, ws, http}) {
  if (!data.message) return
  const [key = '', search = ''] = data.message.toUpperCase().trim().split(/\s+/)
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
        ...(await getDetail(search)),
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getDetail(search),
    })
    return
  }
}