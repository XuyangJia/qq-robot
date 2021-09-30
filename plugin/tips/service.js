import { plugin } from '../../config.js'
export async function getDetail() {
  const options = {
    tips      : '用户发送 "帮助/TIPS/提示", 机器人回复帮助信息',
    almanac   : '用户发送 "黄历/HL", 机器人回复当天黄历',
    board     : '用户发送 "板块/BK 数字/ADD/DEL/> 板块代码/涨幅" ',
    dapan     : '用户发送 "大盘/DP" 机器人回复大盘涨跌图',
    dog       : '用户发送 "舔狗日记", 机器人随机回复一篇日记',
    fund      : '用户发送 "基金/JJ 代码/名称", 机器人返回基金信息',
    mm        : '用户发送 "美女/妹子", 机器人随机回复一张美女图片',
    recall    : '好友或者群消息被撤回, 机器人会复读被撤回的消息 (管理员除外)',
    setu      : '用户发送 "涩图/SETU", 机器人随机回复一张动漫图片',
    stock     : '用户发送 "股票/GP 名称/ADD/DEL 股票代码", 可以管理自己的股票列表',
    wallpaper : '用户发送 "壁纸/美图 动漫/人物", 机器人返回一张高清壁纸',
    weibo     : '用户发送 "微博/WB", 机器人抓取微博热搜 TOP10 返回',
    
  }
  const text = Reflect.ownKeys(plugin).map(key => options[key]).join('\n')
  return [
    {
      type: 'text',
      data: { text }
    }
  ]
}