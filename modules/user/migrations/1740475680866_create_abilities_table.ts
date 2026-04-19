import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'abilities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique()
      table.string('ability')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}