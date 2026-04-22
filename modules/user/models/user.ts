import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v7 } from 'uuid'


const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {

  currentAccessToken?: AccessToken

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string

  @column()
  declare userName: string

  @column()
  declare isDeleted: boolean
  
  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = v7()
  }
  

  static accessTokens = DbAccessTokensProvider.forModel(User)

//   isRegularUser() : boolean
//   {
    
//   }

//   isAdmin() : boolean
//   {
    
//   }
}