import type { CommandOptions } from '@adonisjs/core/types/ace'
import BaseModule from './base_module.js'

export default class CreateModuleMail extends BaseModule {
  static commandName = 'module:mail'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.setUp('mails');
  }
}