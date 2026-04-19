import { args, BaseCommand, flags } from '@adonisjs/core/ace'
import stringHelpers from '@adonisjs/core/helpers/string'
import fs from 'node:fs'
import path from 'node:path'
import { basePath } from '../helpers.js'

type ModuleType = 'controllers' | 'mails' | 'tasks' | 'migrations' | 'reporters' | 'middlewares' | 'features' | 'validators' | 'models' | 'exceptions' | 'enums' | 'services' | 'types'

export default class BaseModule extends BaseCommand {
  static commandName = 'base'
  static description = ''

  @flags.string({ required: true })
  declare module: string

  @args.string({ required: true })
  declare className: string

  async setUp(type: ModuleType) {

    const moduleDir = basePath('modules')
    
    if (!this.module) {
      this.logger.error('Please provide module name')
      return
    }

    if (!this.className) {
      this.logger.error('Please provide class name')
      return
    }

    const module = this.module.toLowerCase()
    
    this.logger.success('starting');
    
    const classPathParts = this.className.split('/')
    const actualClassName = classPathParts.pop() || ''
    const subDirectories = classPathParts.map(part => stringHelpers.snakeCase(part.toLowerCase()))
    
    const modulePath = path.join(moduleDir, module)
    const typePath = path.join(modulePath, type, ...subDirectories)

    await fs.promises.mkdir(typePath, { recursive: true })

    let content: string = await this.getFileContents( type, actualClassName);

    
    if( type === 'migrations' ){

      const filePath = path.join(typePath, `${Date.now()}_${stringHelpers.snakeCase(actualClassName)}.ts`)

      await fs.promises.writeFile(filePath, content)

    }else{

      const filePath = path.join(typePath, `${stringHelpers.snakeCase(actualClassName)}.ts`)

      await fs.promises.writeFile(filePath, content)
    }

    const relativePath = path.join(module, type, ...subDirectories, `${stringHelpers.snakeCase(actualClassName)}.ts`)

    this.logger.success(`Created ${actualClassName} ${type} in ${relativePath}`)
    
  }

  private async getFileContents( type: ModuleType, fileName: string) : Promise<string>
  {
      let content: string = '';

      if( type === 'migrations'){

        content = await fs.promises.readFile( 'stubs/migration.stub', 'utf-8');
        
        content = content.replaceAll('{{ table_name }}', `'${stringHelpers.snakeCase(fileName)}'`)

      }


      if( type === 'controllers'){

        content = await fs.promises.readFile( 'stubs/controller.stub', 'utf-8');
        
        content = content.replaceAll('{{ class_name }}', `${stringHelpers.pascalCase(fileName)}`)

      }

      if( type === 'models'){

        content = await fs.promises.readFile( 'stubs/model.stub', 'utf-8');
        
        content = content.replaceAll('{{ class_name }}', `${stringHelpers.pascalCase(fileName)}`)

      }

      if( type === 'features'){

        content = await fs.promises.readFile( 'stubs/feature.stub', 'utf-8');
        
        content = content.replaceAll('{{ class_name }}', `${stringHelpers.pascalCase(fileName)}`)

      }

      return content;
  }
}