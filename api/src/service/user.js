import User from "../model/user.js"

class UserService {
  async createUser(user) {
    const res = await User.create(user)
    return res.dataValues
  }
  
  async getUserInfo(opts) {
    const res = await User.findOne({
      attributes: ['id', 'username', 'password', 'admin'],
      where: opts
    })
    return res ? res.dataValues : null
  }
}

export default new UserService()