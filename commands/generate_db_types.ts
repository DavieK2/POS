import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const mapping = {
  product: ['products', 'categories'],
}

const DB_PATH = resolve('tmp/db.sqlite3')

export default class GenerateDbTypes extends BaseCommand {
  
  static commandName = 'generate:db-types'
  static description = 'Generates TypeScript types based on the database schema.'

  static options: CommandOptions = {}
  

  async run() {

    console.log('🚀 Generating modular Kysely types...')
      
    if (!existsSync(DB_PATH)) {
      console.error(`❌ Database file not found at: ${DB_PATH}`)
      console.error('Run your migrations first before generating types.')
      process.exit(1)
    }
  
    for (const [mod, tables] of Object.entries(mapping)) {

      const pattern = `(${tables.join('|')})`
      const output = `./modules/${mod}/database/types.ts`
  
      console.log(`📦 Generating types for module: ${mod}`)
  
      execSync(
        `npx --no-install kysely-codegen --dialect sqlite --url "${DB_PATH}" --include-pattern="${pattern}" --out-file ${output} --camel-case`,
        { stdio: 'inherit' }
      )
    }
  }
}