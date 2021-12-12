import { db } from './db/index.js'

async function test() {
  const list = await Promise.all(
    (await db('stock_watch').column('code', 'name', 'add_price', 'prices', 'user_id'))
  )
  for (let index = 0; index < list.length; index++) {
    const {code, name, add_price: price, prices: watch_prices, user_id: username} = list[index];
    const date = new Date
    console.log(username, name, code, price, watch_prices)
    await db('Stocks').insert({
      code, name, price, watch_prices, username,
      check_at: date,
      createdAt: date,
      updatedAt: date,
    })
  }
}
test().then(()=> {
  console.log('完成')
  process.exit(0)
})