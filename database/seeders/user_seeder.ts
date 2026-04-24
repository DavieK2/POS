import { dbq } from '#config/db'
import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { v7 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
     await dbq.insertInto("users").values({
        id: v7(),
        fullName: "Admin",
        username: "admin",
        role: "admin",
        updatedAt: DateTime.now().toString(),
        createdAt: DateTime.now().toString(),
        password: await hash.make("#123Admin123!")
     }).execute()

      await dbq.insertInto("users").values({
        id: v7(),
        fullName: "Demo",
        username: "demo",
        role: "pos",
        updatedAt: DateTime.now().toString(),
        createdAt: DateTime.now().toString(),
        password: await hash.make("demouser")
     }).execute()

     
  }
}