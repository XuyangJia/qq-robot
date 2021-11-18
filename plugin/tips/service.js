import { plugin } from '../../config.js'
export async function getDetail(search) {
  const options = {
    tips      : '用户发送 "TIPS 关键字", 机器人回复帮助信息',
    almanac   : '用户发送 "黄历/HL", 机器人回复当天黄历',
    board     : '用户发送 "板块/BK 数字/ADD/DEL/> 板块代码/涨幅" 查看管理板块列表',
    dapan     : '用户发送 "大盘/DP" 机器人回复大盘涨跌图',
    dog       : '用户发送 "舔狗日记", 机器人回复一篇舔狗日记',
    fanyi     : '用户发送 "翻译 需要翻译的内容", 机器人返回翻译结果(翻译至英文)',
    fund      : '用户发送 "基金/JJ 代码/名称", 机器人返回基金信息',
    mm        : '用户发送 "美女/妹子", 机器人回复一张美女图片',
    recall    : '好友或者群消息被撤回, 机器人会复读被撤回的消息 (管理员除外)',
    sign      : '用户发送 "签到/打卡", 进行签到，并且机器人回复一张美女图片',
    stock     : '用户发送 "股票/GP 名称/ADD/DEL 股票代码", 查看管理股票列表',
    wallpaper : '用户发送 "壁纸 妹子/动漫/风景/cos", 机器人返回一张高清壁纸',
    weibo     : '用户发送 "微博/WB", 机器人抓取微博热搜 TOP10 返回',
    
  }
  const tips = Reflect.ownKeys(plugin).map(key => options[key])
  const text = tips.filter(str => {
    if (str && str.length && /"(.+)"/.test(str)) {
      const match = str.match(/"(.+)"/)[1]
      return match && (new RegExp(search)).test(match)
    }
    return false
  }).join('\n') || tips.join('\n')
  return [
    {
      type: 'text',
      data: { text }
    }
  ]
}