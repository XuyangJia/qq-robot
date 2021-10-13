import { getWallPaper } from './service.js'
const WHITE_LIST = ['壁纸', '美图']
export async function handler({data, ws, http}) {
  if (!data.message) return
  const message = data.message.toUpperCase().trim()
  const [key = '', category = ''] = data.message.toUpperCase().trim().split(/\s+/)
  if (!WHITE_LIST.includes(key)) return
  const options = { '人物': 'meizi', '动漫': 'dongman', '风景': 'fengjing', 'COS': 'cos' }
  const fl = options[category] || 'suiji' 
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
        ...(await getWallPaper(data.user_id, fl)),
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getWallPaper(data.user_id, fl),
    })
    return
  }
}