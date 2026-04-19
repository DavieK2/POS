import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v7 } from 'uuid';
import User from './user.js';
import * as crypto from 'crypto'
import TokenType from '../enums/token_types.js';

export default class UserToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId : string;

  @column()
  declare type : TokenType;

  @column()
  declare tokenString : string;

  @column()
  declare otp : number

  @column()
  declare isConfirmed : boolean

  @column()
  declare expiresAt : DateTime;

  @column()
  declare confirmedAt : DateTime;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async assignToken(userToken: UserToken) : Promise<void> {
    userToken.id = v7();
  }

  static async createEmailVerificationOTP( user: User ) : Promise<number> {

    const otp : number = crypto.randomInt( 100000, 999999 );
  
    await this.updateOrCreate({ userId: user.id, type: TokenType.EMAIL_VERIFICATION },{
        userId: user.id,
        type: TokenType.EMAIL_VERIFICATION,
        otp,
        expiresAt: DateTime.now().plus({ hours: 24 })  
    });

    return otp;
  }

  static async createForgotPasswordToken( user: User ) : Promise<string> {

    const tokenString : string = crypto.randomUUID();
  
    await this.updateOrCreate({ userId: user.id, type: TokenType.PASSWORD_RESET,  },{
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        tokenString,
        expiresAt: DateTime.now().plus({ hours: 24 })  
    });

    return tokenString;

  }

  static async createLoginTokenWithOTP( user: User ){

      const otp : number = crypto.randomInt( 100000, 999999 );
      const tokenString : string = crypto.randomUUID();

      await this.updateOrCreate({ userId: user.id, type: TokenType.ACCESS_TOKEN }, {
          userId: user.id,
          type: TokenType.ACCESS_TOKEN,
          tokenString,
          otp,
          expiresAt: DateTime.now().plus( { minutes: 10 } )  
      });

      return {
        otp,
        tokenString
      }
  }

  static async verifyLoginTokenWithOTP( opts: { otp: number, token: string }) : Promise<User | null> {

      const verify =  await this.query()
                                .where('token_string', opts.token)
                                .where('otp', opts.otp)
                                .where('type', TokenType.ACCESS_TOKEN)
                                .where('expires_at', '>', DateTime.now().toJSDate() )
                                .first();

      if( ! verify ) return null;

      verify.expiresAt = DateTime.now();
      verify.confirmedAt = DateTime.now();
      verify.isConfirmed = true
          
      await verify.save();

      return await User.find(verify.userId) || null

  }

  static async confirmForgotPasswordToken( tokenString: string ) : Promise<User | null> {

      const verification = await this.query().where('token_string', tokenString).where('type', TokenType.PASSWORD_RESET).where('expires_at', '>', DateTime.now().toJSDate() ).first();

      if( ! verification ) return null;

      verification.expiresAt = DateTime.now().plus({ minutes: 30 });
      verification.confirmedAt = DateTime.now();
      verification.isConfirmed = true
        
      await verification.save();

      return await User.find(verification.userId) || null

  }

  static async confirmEmailVerificationOTP( user: User, otp: number ) : Promise<boolean> {

      const verification = await this.query()
                                     .where('user_id', user.id)
                                     .where('otp', otp )
                                     .where('type', TokenType.EMAIL_VERIFICATION)
                                     .where('expires_at', '>', DateTime.now().toJSDate() )
                                     .first();

      
      if( ! verification ) return false;

      verification.expiresAt = DateTime.now();
      
      await verification.save();

      user.isVerified = true;

      user.save();

      return true;

  }
}