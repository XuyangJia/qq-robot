import { getDetail } from './service.js'

export async function handler({data, ws, http}) {
  if (!data.message) return
  let api = 'http://timor.tech/api/holiday/'
  const message = data.message.trim()
  if (message.includes('下次放假')) {
    api += 'tts/next'
  } else if (message.includes('明天放假')) {
    api += 'tts/tomorrow'
  } else if (['节假日', '放假', '节日'].some(str => message.includes(str))) {
    api += 'tts'
  } else {
    return
  }
  
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
        ...(await getDetail(api)),
        {
          "type": "at",
          "data": {
              "qq": data.user_id,
              "name": "昵称获取失败"
          }
        }
      ],
    })
    return
  }

  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: await getDetail(api),
    })
    return
  }
}