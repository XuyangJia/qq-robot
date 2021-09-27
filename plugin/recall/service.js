import moment from 'moment'
export async function getRecall(http, message_id) {
  console.log(message_id)
  try {
    const { data: { message, time, sender: { nickname } } } = await http.send('get_msg', { message_id })
    const timeString = moment(new Date(time * 1000)).format('LTS')
    return `===== 撤回消息提醒 =====\n发现 ${nickname} ${timeString} 撤回了一条消息，消息内容如下：\n${message}`
  } catch (e) {
    console.error('[recall]', e)
    return null
  }
}
