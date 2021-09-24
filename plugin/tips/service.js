export async function getDetail() {
  const text = `
  用户发送 "黄历/HL", 机器人回复当天黄历
  用户发送 "舔狗日记", 机器人随机回复一篇日记
  用户发送 "MN/MM/MZ/美女/妹妹/妹子", 机器人随机回复一张美女图片
  好友或者群消息被撤回, 机器人会复读被撤回的消息 (管理员除外)
  用户发送 "帮助/TIPS/提示", 机器人回复帮助信息
  用户发送 "微博/热搜/WB/RS", 机器人抓取微博热搜 TOP10 返回
  `
  return [
    {
      type: 'text',
      data: { text }
    }
  ]
}