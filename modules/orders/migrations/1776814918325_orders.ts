import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique()
      table.string('status').nullable().defaultTo("active")
      table.json("items").nullable()
      table.decimal("discount").nullable()
      table.string("note").nullable()
      table.string("payment_method").nullable()
      table.uuid("user_id").notNullable()
      table.foreign("user_id").references("users.id").onDelete("SET NULL")
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}