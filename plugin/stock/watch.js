import { getCode, getDetail } from './service.js'
import { db } from '../../db/index.js'

async function addWatch(user_id, code, name, prices) {
  console.log(user_id, code, name, prices)
  const [{ has }] = await db('stock_watch')
    .where({ user_id, code })
    .count('id as has')
  if (!has) {
    await db('stock_watch').insert({
      user_id,
      code,
      name,
      prices,
      execute_at: new Date(),
    })
  } else {
    await db('stock_watch')
    .where({ user_id, code })
    .update({ prices })
  }
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
    (await db('stock_watch').column('code', 'name', 'prices').where('user_id', user_id))
  )
  if (!list.length) return '尚未添加任何监控\n 添加: JK 名称/代码 价格\n 删除: JK 名称/代码'
  return '赌场代码    赌场名称    价格\n'
  + list.map(({ code, name, prices }) => {
    return [code, name, prices].join('    ')
  }).join('\n')
}

async function checkStock(http, { user_id, code, prices, execute_at }) {
  if (Date.now() - execute_at > 10 * 60 * 1000) {
    const { f58, f43 } = await getDetail(code)
    const reach = prices.split(' ').map(parseFloat).some(price => f43 >= price)
    if (reach) {
      const message = `${f58} 价格已达到 ${f43}`
      const { status } = await http.send('send_private_msg', { user_id, group_id: 909056743, message })
      if (status === 'ok') {
        await db('stock_watch')
        .where({ user_id, code })
        .update({ execute_at: new Date() })
      }
    }
  }
}

async function check(http) {
  const date = new Date
  const h = date.getHours()
  const m = date.getMinutes()
  if ((h === 9 && m >= 30) || (h >=10 && h <= 12) || (h >=13 && h <= 15)) {
    const list = await Promise.all(
      await db('stock_watch').column('user_id', 'code', 'prices', 'execute_at')
    )
    list.forEach(obj => checkStock(http, obj))
  }
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
