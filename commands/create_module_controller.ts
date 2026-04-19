import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleController extends BaseModule {
  static commandName = 'module:controller'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('controllers');
  }
}