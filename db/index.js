import knex from 'knex'

export const db = knex({
  client: 'mysql',
  connection: {
    host : '121.89.223.177',
    port : 3306,
    user : 'root',
    password : '123456',
    database : 'robot'
  }
})