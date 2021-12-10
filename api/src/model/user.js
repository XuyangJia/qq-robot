import pkg from 'sequelize'
import { sequelize } from '../db/seq.js'

const { DataTypes } = pkg
const User = sequelize.define('User', {
  username: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    comment: '用户名（QQ号）'
  },
  admin: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
    comment: '管理员'
  },
  password: {
    type: DataTypes.CHAR(64),
    allowNull: false,
    comment: '密码'
  },
  nickname: {
    type: DataTypes.CHAR(64),
    defaultValue: '',
    comment: '昵称'
  },
  coin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '余额'
  },
  sign_times: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '签到次数'
  },
  sign_at: {
    type: DataTypes.DATE,
    comment: '上次签到时间'
  }
})

// User.sync({ force: true }) // 强制重建数据表(覆盖旧表)
export default User