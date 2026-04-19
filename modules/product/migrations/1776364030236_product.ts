import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique()
      table.string('product_name').notNullable()
      table.string('description').nullable()
      table.string('product_code').notNullable()
      table.string('product_image').nullable()
      table.integer('quantity').nullable()
      table.uuid('category_id').nullable()
      table.foreign('category_id').references('categories.id').onDelete('SET NULL')
      table.integer('price').notNullable()
      table.string('barcode').nullable()
      table.string('barcode_image').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}