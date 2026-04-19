import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').references('users.id').notNullable()
      table.uuid('role_id').references('roles.id').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}