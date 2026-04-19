import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleValidators extends BaseModule {
  static commandName = 'module:validator'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('validators');
  }
}