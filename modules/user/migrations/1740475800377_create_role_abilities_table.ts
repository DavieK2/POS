import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_abilities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('role_id').references('roles.id').onDelete('CASCADE').index()
      table.uuid('ability_id').references('abilities.id').onDelete('CASCADE').index()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}