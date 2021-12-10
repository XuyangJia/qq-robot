import bcrypt from 'bcryptjs'
import { validator } from './validator.js'
import { formatError, userDoseNotExist, userExisted, userInfoError } from "../constants/error.type.js"
import userService from '../service/user.js'

export const userValidator = await validator({
  username: 'string',
  nickname: { type: 'string', required: false },
  password: 'string',
})

export async function vereifyUser(ctx, next) {
  const { username } = ctx.request.body
  try {
    const res = await userService.getUserInfo({ username })
    if (res) return ctx.app.emit('error', userExisted, ctx)
  } catch (error) {
    console.log(userInfoError.message, error)
    userInfoError.result = error
    return ctx.app.emit('error',  userInfoError, ctx)
  }
  await next()
}

export async function cryptPassword(ctx, next) {
  const { password } = ctx.request.body
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  ctx.request.body.password = hash
  await next()
}

export async function verifyLogin(ctx, next) {
  const { username, password } = ctx.request.body
  try {
    const res = await userService.getUserInfo({ username })
    if (!res) return ctx.app.emit('error', userDoseNotExist, ctx)
    
  } catch (error) {
    console.log(userInfoError.message, error)
    userInfoError.result = error
    return ctx.app.emit('error',  userInfoError, ctx)
  }
  await next()
}