import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v7 } from 'uuid'
import UserType from '../enums/user_types.js'
import ReferralService from '../services/referral_service.js'


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
  declare email: string

  @column()
  declare userType: string

  @column()
  declare phoneNo: string

  @column()
  declare countryCode: number

  @column()
  declare referralCode: string

  @column()
  declare referredBy: string
  
  @column()
  declare countryId: string

  @column()
  declare stateId: string

  @column()
  declare state: string
  
  @column()
  declare location: string

  @column()
  declare city: string

  @column()
  declare postalCode: string

  @column()
  declare profilePic: string

  @column()
  declare isVerified: boolean

  @column()
  declare isApproved: boolean

  @column()
  declare isAvailable: boolean

  @column()
  declare isDeleted: boolean

  @column()
  declare isBanned: boolean

  @column()
  declare deletedAt: DateTime

  @column()
  declare hasAddedPaymentMethod: boolean

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
  
  @beforeCreate()
  public static async assignReferralCode(user: User) {
    user.referralCode = await ReferralService.generateReferralCode()
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)

  isRegularUser() : boolean
  {
    return this.userType === UserType.Normal; 
  }

  isAdmin() : boolean
  {
    return this.userType === UserType.Admin; 
  }
}