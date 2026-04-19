import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('phone_no').nullable().unique()
      table.integer('country_code').nullable()
      table.jsonb('dob').nullable()
      table.string('user_type', 50).notNullable().index();
      table.string('referral_code').notNullable().unique()
      table.uuid('referred_by').references('users.id').nullable().onDelete('SET NULL')
      table.string('country').nullable()
      table.string('profile_pic').nullable()
      table.boolean('has_added_payment_method').defaultTo(false)
      table.boolean('is_verified').defaultTo(false)
      table.boolean('should_reset_password').defaultTo(false)
      table.float('wallet_balance').defaultTo(0)
      table.float('escrow_balance').defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.boolean('is_deleted').defaultTo(false)
      table.boolean('is_banned').defaultTo(false)
      table.timestamp('deleted_at').nullable()
    })
    
  }

  async down() {
    
    this.schema.dropTable(this.tableName);

  }
}