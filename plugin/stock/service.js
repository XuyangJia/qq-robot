import fetch from 'node-fetch'
import moment from 'moment'

const API = 'http://127.0.0.1:8989/stocks/'
let watchList = []
getWatchList() // 初始化监控列表
async function getWatchList() {
  try {
    const response = await fetch(`${API}?pageNum=1&pageSize=9999`)
    const { result: { list } } = await response.json()
    if (list && list.length) {
      watchList = list
    }
  } catch (error) {
    console.log('获取监控列表失败', error);
  }
}

async function addWatch(username, opts) {
  const { code, name, price, watch_prices } = opts
  const response = await fetch(`${API}add`, {
    method: 'POST',
    body: JSON.stringify({username, code, watch_prices}),
    headers: {'Content-Type': 'application/json'}
  })
  const data = await response.json()
  getWatchList() // 刷新监控列表
  return [data.result, `${code} ${name} ${price} --> ${watch_prices}`].join('\n')
}

async function delWatch(username, opts) {
  const { code, name } = opts
  const response = await fetch(`${API}del`, {
    method: 'POST',
    body: JSON.stringify({username, code}),
    headers: {'Content-Type': 'application/json'}
  })
  const data = await response.json()
  if (data.result) {
    getWatchList() // 刷新监控列表
    return [data.message, `${code} ${name}`].join('\n')
  }
  return '操作失败，请检查要删除的监控是否存在'
}

async function getList(username) {
  if (!watchList.length) return `
  尚未添加任何监控, 请使用以下命令进行操作:
  添加: JK/监控 名称/代码 价格(多个价格用空格分隔)
  删除: JK/监控 名称/代码
  查询已添加: JK/监控
  `
  return '股票代码    股票名称    基准价格    监控价格\n'
  + watchList.map(({ code, name, price, watch_prices }) => {
    return [code, name, price, watch_prices].join('     ')
  }).join('\n')
}

async function checkStock(http, { id, username, code, price: add_price, watch_prices, check_at }) {
  const lastExecute = new Date(check_at).getTime()
  if (Date.now() - lastExecute > 10 * 60 * 1000) {
    const detail = await getDetail(code)
    if (!detail) return
    const { name, price: curr_price, change } = detail
    const reach = watch_prices.split(' ').map(parseFloat).some(price => {
      return (price <= add_price && price >= curr_price) || (price > add_price && price < curr_price)
    })
    if (reach) {
      const hintStr = Number(change) > 0 ? '↑' : '↓'
      const message = '股票代码    股票名称    基准价格    监控价格\n'
      + [code, name, add_price, watch_prices].join('     ')
      + `\n\n当前价格：${curr_price}  ${hintStr}：${change}%`
      const { status } = await http.send('send_private_msg', { user_id: username, group_id: 909056743, message })
      if (status === 'ok') {
        const response = await fetch(`${API}`, {
          method:'PATCH',
          body: JSON.stringify({ id, check_at: (new Date).toJSON() }),
          headers: {'Content-Type': 'application/json'}
        })
        await response.json()
      }
    }
  }
}

let executeRecord ={}
async function isTradingDay() {
  const date = moment().format('YYYYMMDD')
  if (executeRecord[date] === undefined) {
    const response = await fetch(`https://tool.bitefu.net/jiari/?d=${date}`)
    const data = await response.text()
    executeRecord[date] = parseInt(data)
  }
  return executeRecord[date] === 0
}

async function check(http) {
  const tradingDay = await isTradingDay()
  if (!tradingDay) return
  const dealTime = [['09:25', '11:30'], ['13:00', '15:00']]
  const valid = dealTime.some(([begin, end]) => {
    return moment(begin, 'HH:mm').isBefore() && moment(end, 'HH:mm').isAfter()
  })
  if (!valid) return
  watchList.forEach(obj => checkStock(http, obj))
}

async function getDetail(keyword) {
  const response = await fetch(`${API}info/${keyword}`)
  const { result } = await response.json()
  return result
}
export async function queryStock(username, keyword) {
  const response = await fetch(`${API}${keyword}`)
  const { result } = await response.json()
  if (result.length) {
    const myList = watchList.filter(obj => obj.username == username)
    const watched = result.some(obj1 => myList.some(obj2 => obj1.code === obj2.code))
    const title = `股票名称    股票代码    最新价    涨跌幅${watched ? '    基准价格    监控价格' : ''}\n`
    return title + result.map(({ name, code, price, change}) => {
      const messages = [name, code, price, `  ${change}%`]
      const watchDetail = myList.find(obj => obj.code === code)
      if (watchDetail) {
        messages.splice(4, 0, watchDetail.price, watchDetail.watch_prices)
      }
      return messages.join('    ')
    }).join('\n')
  } else {
    return '未找到相关股票'
  }
}

export async function manageWatch(username, keyword, ...prices) {
  if (!keyword) return await getList(username)
  const result = await getDetail(keyword)
  if (!result) return `未查找到相应股票`
  if (prices.length) {
    const invalid = prices.map(parseFloat).some(Number.isNaN)
    if (invalid) return '价格格式无效，请重新输入'
    const watch_prices = prices.join(' ')
    return await addWatch(username, Object.assign({ watch_prices }, result))
  }
  return await delWatch(username, result)
}

let count = 0
const delay = 5
export async function tick(http) {
  count = (count + 1) % delay
  if (!count) check(http)
}
