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
  // if (group_id) {
  //   console.log(group_id)
  // }
  plugins.forEach(({ handler }) => handler({ data, ws, http }))
})
