import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleExceptions extends BaseModule {
  static commandName = 'module:exception'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('exceptions');
  }
}