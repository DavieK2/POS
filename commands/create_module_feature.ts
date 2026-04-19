import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleFeature extends BaseModule {
  static commandName = 'module:feature'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('features');
  }
}