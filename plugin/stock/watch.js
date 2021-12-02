import fetch from 'node-fetch'
import moment from 'moment'
import { getCode, getDetail } from './service.js'
import { db } from '../../db/index.js'

async function addWatch(user_id, code, name, prices) {
  console.log(user_id, code, name, prices)
  const { f43: add_price } = await getDetail(code)
  const [{ has }] = await db('stock_watch')
    .where({ user_id, code })
    .count('id as has')
  if (has) {
    await db('stock_watch')
    .where({ user_id, code })
    .update({ add_price, prices, execute_at: new Date() })
    return ['监控更新成功', `${code} ${name} ${add_price} ${prices}`].join('\n')
  }
  await db('stock_watch').insert({
    user_id,
    code,
    name,
    add_price,
    prices,
    execute_at: new Date(),
  })
  return ['监控添加成功', `${code} ${name} ${prices}`].join('\n')
}

async function delWatch(user_id, code, name) {
  const effectCount = await db('stock_watch')
  .where({
    user_id,
    code: code,
  })
  .del()
  if (effectCount) return ['监控删除成功', `${name} ${code}`].join('\n')
}

async function getList(user_id) {
  const list = await Promise.all(
    (await db('stock_watch').column('code', 'name', 'add_price', 'prices').where('user_id', user_id))
  )
  if (!list.length) return `
  尚未添加任何监控, 请使用以下命令进行操作:
  添加: JK/监控 名称/代码 价格(多个价格用空格分隔)
  删除: JK/监控 名称/代码
  查询已添加: JK/监控
  `
  return '股票代码    股票名称    基准价格    监控价格\n'
  + list.map(({ code, name, add_price, prices }) => {
    return [code, name, add_price, prices].join('     ')
  }).join('\n')
}

async function checkStock(http, { user_id, code, add_price, prices, execute_at }) {
  if (Date.now() - execute_at > 10 * 60 * 1000) {
    const { f58:name, f43:current_price, f170:range } = await getDetail(code)
    const reach = prices.split(' ').map(parseFloat).some(price => {
      return (add_price <= price && current_price >= price) || (add_price > price && current_price < price)
    })
    if (reach) {
      range = range > 0 ? `涨幅:${range}%` : `跌幅:${range}%`
      const message = `${name} 价格已达到 ${current_price} ${range}`
      const { status } = await http.send('send_private_msg', { user_id, group_id: 909056743, message })
      if (status === 'ok') {
        await db('stock_watch')
        .where({ user_id, code })
        .update({ execute_at: new Date() })
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
  const list = await Promise.all(
    await db('stock_watch').column('user_id', 'code', 'add_price', 'prices', 'execute_at')
  )
  list.forEach(obj => checkStock(http, obj))
}

async function initDatabase() {
  // await db.schema.dropTableIfExists('stock_watch')
  const has = await db.schema.hasTable('stock_watch')
  if (has) return
  console.log('开始初始化数据库')
  await db.schema.createTable('stock_watch', table => {
    table.increments('id').primary()
    table.integer('user_id').index()
    table.string('code')
    table.string('name')
    table.integer('add_price')
    table.string('prices')
    table.dateTime('execute_at')
  })
  console.log('[stock_watch]', '初始化数据库完毕')
}

async function isWatching(user_id, code) {
  const [{ has }] = await db('stock_watch')
  .where({ user_id, code })
  .count('id as has')
  return has
}

export async function manageWatch(user_id, keyword, ...prices) {
  await initDatabase()
  if (!keyword) return await getList(user_id)
  const { code, name } = await getCode(keyword)
  const watched = await isWatching(user_id, code)
  if (prices.length) {
    const invalid = prices.map(parseFloat).some(Number.isNaN)
    if (invalid) return '价格格式无效，请重新输入'
    return await addWatch(user_id, code, name, prices.join(' '))
  } else if (watched) {
    return await delWatch(user_id, code, name)
  }
  return '操作无效'
}

let count = 0
const delay = 5
export async function tick(http) {
  count = (count + 1) % delay
  if (!count) check(http)
}
