import { formatError } from '../constants/error.type.js'

export async function validator(rules) {
  return async function (ctx, next){
    try {
      ctx.verifyParams(rules)
    } catch (error) {
      console.log(error)
      formatError.result = error
      return ctx.app.emit('error', formatError, ctx)
    }
    await next()
  }
}