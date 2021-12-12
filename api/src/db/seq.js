import { Sequelize } from 'sequelize'
import { env } from '../config/default.js'

export const seq = new Sequelize(env.mysql_options)