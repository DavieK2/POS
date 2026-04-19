import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique()
      table.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable().index()
      table.string('type').notNullable()
      table.string('token_string').nullable()
      table.integer('otp').nullable()
      table.boolean('is_confirmed').defaultTo(false)
      table.timestamp('expires_at')
      table.timestamp('confirmed_at')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}