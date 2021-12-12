import { ensureDirSync } from 'fs-extra'
import { resolve } from 'path'
import Koa from 'koa'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
import parameter from 'koa-parameter'
import { router } from '../router/index.js'
import { errHandler } from './errHandler.js'

const app = new Koa()

const uploadDir = resolve('src', 'upload')
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir,
    keepExtensions: true
  },
  // strict: false
  parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE']
}))
// ensureDirSync(uploadDir)
// app.use(koaStatic(uploadDir))
app.use(parameter(app))
app.use(router.routes())
app.use(router.allowedMethods())
app.on('error', errHandler)
export { app }