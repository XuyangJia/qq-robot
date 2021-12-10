import { readdirSync } from 'fs'
import { dirname } from 'path'
import Router from 'koa-router'

const router = new Router()
const routerDir = dirname(decodeURI(import.meta.url).replace(/^file:\/\/\//, ''))
readdirSync(routerDir).forEach(file => {
  if (file !== 'index.js') {
    import(`./${file}`).then(r => router.use(r.router.routes()))
  }
})

export { router }