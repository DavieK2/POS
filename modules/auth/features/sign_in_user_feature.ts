import AppErrors, { TError, ValidationErrorMessage } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import User from "#modules/user/models/user";
import { pipe } from "fp-ts/lib/function.js";

const rules = type({
    username: 'string & string > 0',
    password: 'string'
});

type ParamsType = typeof rules.infer

export default class SignInUserFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType): Promise<E.Either<TError, any>> {
          return await SignInUserFeature.use<typeof params, typeof params>(params)
                                        .chain((data, _) => ValidationService.validate({ rules, data }))
                                        .chainAndStore('user', (_, data) => this.verifyUserCredentials({ username: data.username, password: data.password }))
                                        .chain((user, _) => this.verifyIfUserAccountIsDeleted(user))
                                        .chain((user, _) => this.generateUserLoginToken(user))
                                        .chain((token, data) => TE.right({
                                            message: "Logged in",
                                            token,
                                            user: {
                                                userName: data.__user.userName,
                                                fullName: data.__user.fullName,
                                                role: data.__user.role
                                            }
                                        }))
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    verifyUserCredentials(opts: { username: string, password: string }) {

        return TE.tryCatch(
            () => User.verifyCredentials(opts.username, opts.password),
            (error) => AppErrors.HandledError(error, "Invalid user credentials.", 403)
        )
    }

    verifyIfUserAccountIsDeleted(user: User): TE.TaskEither<ValidationErrorMessage, User> {

        return pipe(
            user,
            TE.fromPredicate(
                () => !(user && user.isDeleted),
                () => AppErrors.ValidationErrorMessage("Invalid user credentials.")
            )
        );
    }
    generateUserLoginToken = (user: User) => {

        return pipe(
            TE.tryCatch(
                () => User.accessTokens.create(user),
                (err) => AppErrors.UnhandledError(err, "There was an error.")
            ),
            TE.map(token => token.value?.release())
        );
    }
}