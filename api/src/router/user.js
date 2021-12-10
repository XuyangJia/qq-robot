import Router from 'koa-router'
import userController from '../controller/user.js'
import { cryptPassword, userValidator, vereifyUser } from '../middleware/user.js'

const router = new Router({prefix:'/users'})

// 注册
router.post('/register', userValidator, vereifyUser, cryptPassword, userController.create)
// 登录
router.post('/login', userValidator, userController.login)
// 修改密码

export { router }