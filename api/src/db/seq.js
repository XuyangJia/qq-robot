import { Sequelize } from 'sequelize'
import { env } from '../config/default.js'

export const sequelize = new Sequelize(env.mysql_options)