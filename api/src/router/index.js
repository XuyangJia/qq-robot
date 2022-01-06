import { readdirSync } from 'fs'
import Router from '@koa/router'

const router = new Router()
const routerDir = './src/router'
readdirSync(routerDir).forEach(file => {
  if (file !== 'index.js') {
    import(`./${file}`).then(r => router.use(r.router.routes()))
  }
})

export { router }
