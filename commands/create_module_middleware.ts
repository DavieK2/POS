import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleMiddleware extends BaseModule {
  static commandName = 'module:middleware'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('middlewares');
  }
}