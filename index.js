import { ws, http } from './bot/index.js'
import { plugin } from './config.js'

// 加载插件
const plugins = await Promise.all(Reflect.ownKeys(plugin).map(key => import(`${key}/index.js`)))
ws.listen(data => {
  if (data.meta_event_type === 'heartbeat') return
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(data)
  // }
  plugins.forEach(({ handler }) => handler({ data, ws, http }))
})
