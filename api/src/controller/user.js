import jwt from 'jsonwebtoken'
import userService from '../service/user.js'
import { userLoginError, userRegisterError } from '../constants/error.type.js'
import { env } from '../config/default.js'

class UserController {
  async create(ctx) {
    try {
      const user = ctx.request.body
      const { username } = user
      const { id } = await userService.createUser(user)
      ctx.body = {
        code: 0,
        message: '注册成功',
        result: { id, username }
      }
    } catch (error) {
      console.log(userRegisterError.message)
      return ctx.app.emit('error', userRegisterError, ctx)
    }
  }
  
  async login(ctx) {
    try {
      const { username } = ctx.request.body
      const { password, ...payload } = await userService.getUserInfo({ username })
      ctx.body = {
        code: 0,
        message: '用户登录成功',
        result: { 
          token: jwt.sign(payload, env.jwt_secret, { expiresIn: '1d' })
         }
      }
    } catch (error) {
      console.log(userLoginError.message, error)
      userLoginError.result = error
      return ctx.app.emit('error', userLoginError, ctx)
    }
  }
}

export default new UserController