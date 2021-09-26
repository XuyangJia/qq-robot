import { resolve } from 'path'
import knex from 'knex'

const filename = resolve(process.cwd(), 'db/db.sqlite')
export const db = knex({
  client: 'sqlite3',
  connection: { filename },
  useNullAsDefault: true,
})
