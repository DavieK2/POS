import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleMigration extends BaseModule {
  static commandName = 'module:migration'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('migrations');
  }
}