import Database from 'better-sqlite3'
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely'
import app from '@adonisjs/core/services/app'
import { DB } from '#database/db_shema'

const sqlite = new Database(app.tmpPath('db.sqlite3'))
sqlite.pragma('foreign_keys = ON')

export const dbq = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sqlite,
  }),
  plugins: [new CamelCasePlugin()]
})