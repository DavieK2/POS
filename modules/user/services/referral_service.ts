import db from "@adonisjs/lucid/services/db";

export default class ReferralService {

    static async generateReferralCode(): Promise<string>
    {

        let referralCode = this.generateCode();

        while( await db.from('users').where('referral_code', referralCode).select('referral_code').first() ){

            referralCode =  this.generateCode();
        }

        return referralCode;

    }

    private static generateCode() : string 
    {
        return btoa( Math.random().toString() ).substring(15, 25);
    }
}