import fetch from 'node-fetch'
import moment from 'moment'

const API = 'http://127.0.0.1:3000/stocks/'

async function addWatch(username, code, name, watch_prices) {
  const response = await fetch(`${API}add`, {
    method: 'POST',
    body: JSON.stringify({username, code, watch_prices}),
    headers: {'Content-Type': 'application/json'}
  })
  const data = await response.json()
  return [data.result, `${code} ${name} ${watch_prices}`].join('\n')
}

async function delWatch(username, code, name) {
  const response = await fetch(`${API}del`, {
    method: 'POST',
    body: JSON.stringify({username, code}),
    headers: {'Content-Type': 'application/json'}
  })
  const data = await response.json()
  if (data.result) {
    return [data.message, `${code} ${name}`].join('\n')
  }
  return '操作失败，请检查要删除的监控是否存在'
}

async function getList(username) {
  const response = await fetch(`${API}?pageNum=1&pageSize=9999&username=${username}`)
  const { result: { list } } = await response.json()
  if (!list.length) return `
  尚未添加任何监控, 请使用以下命令进行操作:
  添加: JK/监控 名称/代码 价格(多个价格用空格分隔)
  删除: JK/监控 名称/代码
  查询已添加: JK/监控
  `
  return '股票代码    股票名称    基准价格    监控价格\n'
  + list.map(({ code, name, price, watch_prices }) => {
    return [code, name, price, watch_prices].join('     ')
  }).join('\n')
}

async function checkStock(http, { id, username, code, add_price, watch_prices, check_at }) {
  const lastExecute = new Date(check_at).getTime()
  if (Date.now() - lastExecute > 10 * 60 * 1000) {
    const detail = await getDetail(code)
    if (!detail) return;
    const { name, price, change } = detail
    const reach = watch_prices.split(' ').map(parseFloat).some(price => {
      return (add_price <= price && price >= price) || (add_price > price && price < price)
    })
    if (reach) {
      const hintStr = Number(change) > 0 ? '↑' : '↓'
      const message = `${name} ￥：${price}  ${hintStr}：${change}%`
      const { status } = await http.send('send_private_msg', { username, group_id: 909056743, message })
      if (status === 'ok') {
        const response = await fetch(`${API}`, {
          method:'PATCH',
          body: JSON.stringify({ id, check_at: new Date }),
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
  const dealTime = [['09:30', '11:30'], ['13:00', '15:00']]
  const valid = dealTime.some(([begin, end]) => {
    return moment(begin, 'HH:mm').isBefore() && moment(end, 'HH:mm').isAfter()
  })
  if (!valid) return
  const response = await fetch(`${API}?pageNum=1&pageSize=9999`)
  const { result: { list } } = await response.json()
  list.forEach(obj => checkStock(http, obj))
}

async function getDetail(keyword) {
  const response = await fetch(`${API}info/${keyword}`)
  const { result } = await response.json()
  return result
}

export async function manageWatch(username, keyword, ...prices) {
  if (!keyword) return await getList(username)
  const result = await getDetail(keyword)
  if (!result) return `未查找到相应股票`
  const { code, name } = result
  if (prices.length) {
    const invalid = prices.map(parseFloat).some(Number.isNaN)
    if (invalid) return '价格格式无效，请重新输入'
    return await addWatch(username, code, name, prices.join(' '))
  }
  return await delWatch(username, code, name)
}

let count = 0
const delay = 5
export async function tick(http) {
  count = (count + 1) % delay
  if (!count) check(http)
}
