import { getRecall } from './service.js'

export async function handler({data, ws, http}) {
  // 非本人撤回 (一般是管理员撤回的), 不复读
  if (data.operator_id !== data.user_id) {
    return
  }
  if (data.notice_type === 'group_recall') {
    const { data: { role } } = await http.send('get_group_member_info', { group_id: data.group_id, user_id: data.user_id })
    // if (['owner', 'admin'].includes(role)) return
    const message = await getRecall(http, data.message_id)
    if (message) {
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message,
      })
    }
  } else if (data.notice_type === 'friend_recall') {
    const message = await getRecall(http, data.message_id)
    if (message) {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message,
      })
    }
  }
}
