import { getWallPaper } from './service.js'
const WHITE_LIST = ['壁纸', '美图']
export async function handler({data, ws, http}) {
  if (!data.message) return
  const message = data.message.toUpperCase().trim()
  const [key = '', key2 = ''] = data.message.toUpperCase().trim().split(/\s+/)
  if (!WHITE_LIST.includes(key)) return
  const options = { '动漫': '010', '人物': '001' }
  const categories = options[key2] || '100' 
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
        ...(await getWallPaper(categories)),
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getWallPaper(categories),
    })
    return
  }
}