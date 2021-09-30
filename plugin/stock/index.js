import { manageStock } from './service.js'
import { manageWatch } from './watch.js'
const WHITE_LIST = [['股票', 'GP'], ['监控', 'JK']]

export async function handler({data, ws, http}) {
  if (!data.message) return
  const [key = '', ...args] = data.message.toUpperCase().trim().split(/\s+/)
  const i = WHITE_LIST.findIndex(arr => arr.includes(key))
  if (i === -1) return
  const handler = [manageStock, manageWatch][i]
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
        {
          type: 'text',
          data: {
            text: await handler(data.user_id, ...args)
          }
        }
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: [
        {
          type: 'text',
          data: {
            text: await handler(data.user_id, ...args)
          }
        }
      ]
    })
    return
  }
}

export { tick } from './watch.js'