import Sequelize from 'sequelize'
import { seq } from '../db/seq.js'

const { DataTypes } = Sequelize
const Stock = seq.define('Stock', {
  username: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    comment: '用户名（QQ号）'
  },
  name: {
    type: DataTypes.CHAR(64),
    allowNull: false,
    comment: '股票名称'
  },
  code: {
    type: DataTypes.CHAR(64),
    allowNull: false,
    comment: '股票代码'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '添加时价格'
  },
  watch_prices: {
    type: DataTypes.CHAR(64),
    comment: '监控价格'
  },
  check_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    comment: '上次检查时间'
  }
}, { paranoid: true })

// Stock.sync({ force: true }) // 强制重建数据表(覆盖旧表)
export default Stock