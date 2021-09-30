import { ws, http } from './bot/index.js'
import { plugin } from './config.js'

// 加载插件
const plugins = await Promise.all(Reflect.ownKeys(plugin).map(key => import(`./plugin/${key}/index.js`)))
ws.listen(data => {
  if (data.meta_event_type === 'heartbeat') return
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(data)
  // }
  // const { group_id } = data
  plugins.forEach(({ handler }) => handler({ data, ws, http }))
})

function _update() { // 定时器
  plugins.forEach(({ tick }) => tick && tick(http))
  setTimeout(_update, 1000)
}
_update()

