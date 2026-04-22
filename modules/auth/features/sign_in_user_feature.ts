import AppErrors, { TError, ValidationErrorMessage } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import User from "#modules/user/models/user";
import { pipe } from "fp-ts/lib/function.js";

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
}