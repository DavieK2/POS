import AppErrors, { TError, ValidationErrorMessage } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import User from "#modules/user/models/user";
import { pipe } from "fp-ts/lib/function.js";
import UserToken from "#modules/user/models/user_token";
import { generateUserLoginToken } from "../tasks/auth_tasks.js";
// import SMSService from "#modules/notification/services/sms_service";

const rules = type({
    email: 'string & string.email',
    password: 'string',
    loginType: type('string').optional(),
    ipAddress: type('string').optional()
});

type ParamsType = typeof rules.infer

export default class SignInUserFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType ): Promise<E.Either<TError, any>> {
          return await SignInUserFeature.use<typeof params, typeof params>(params)
                                        .chain( (data, _) => ValidationService.validate({ rules, data }) )
                                        .chainAndStore('user', (_, data) => this.verifyUserCredentials({ email: data.email, password: data.password }) )
                                        .chain( (user, _) => this.verifyIfUserAccountIsDeleted(user) )
                                        .chain( (user, _) => this.checkIfUserIsAdmin(user) )
                                        .chainIfElseAndStore({
                                            storeKey: 'token',
                                            condition : (_, data) => data.__user.isAdmin(),
                                            onTrue: (_, data) => this.generateAdminToken(data.__user),
                                            onFalse: (_, data) => generateUserLoginToken(data.__user)
                                        })
                                        // .chainWhen({
                                        //     condition : (_, data) => data.__user.isAdmin(),
                                        //     action: (_, data) => this.sendOTP({
                                        //         ip: data.ipAddress!,
                                        //         otp: Object(data.__token).otp
                                        //     })
                                        // })
                                        .chainIfElse({
                                            condition : (_, data) => data.__user.isAdmin(),
                                            onTrue: (_, data) => TE.right({
                                                message: 'An OTP has been sent to your phone number',
                                                admin_token: Object(data.__token).tokenString
                                            }),
                                            onFalse: (_, data) => TE.right({
                                                message: 'User logged in successfully',
                                                access_token: data.__token
                                            }),
                                            log: (_,data) => ({
                                                module: 'auth',
                                                action: 'Sign In',
                                                description: data.__user.isAdmin() ? 'Attempting to sign in.' : 'User was successfully logged in.',
                                                ipAddress: data.ipAddress,
                                                userId: data.__user.id
                                            })
                                        })
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    verifyUserCredentials( opts: { email: string, password: string } ){

        return TE.tryCatch(
            () => User.verifyCredentials( opts.email, opts.password ),
            (error) => AppErrors.HandledError( error, "Invalid user credentials.", 403 )
        )
    }

    verifyIfUserAccountIsDeleted( user: User ) : TE.TaskEither<ValidationErrorMessage, User>{

        return pipe(
            user,
            TE.fromPredicate(
                () => ! ( user && user.isDeleted ),
                () => AppErrors.ValidationErrorMessage("Invalid user credentials.")
            )
        );
    }

    checkIfUserIsAdmin( user: User ){

        return E.right( user.isAdmin() )
    }

    generateAdminToken( user: User ) {

        return pipe(
            TE.tryCatch(
                () => UserToken.createLoginTokenWithOTP( user ),
                (err) => AppErrors.HandledError(err, "There was an logging you in.")
            )
        );
    }

    // sendOTP( opts: { otp: number, ip: string }){

    //     return TE.tryCatch(
    //         () => ( new SMSService ).sendSMS({
    //                     phoneNumber: '+610401126285',
    //                     message: `OTP for Admin Login: ${opts.otp.toString()}.`,
    //                     ip: opts.ip
    //                 }),
    //         (err) => AppErrors.HandledError(err, "There was an error sending OTP")
    //     )
    // }
}