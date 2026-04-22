import AppErrors from "#exceptions/app_error";
import UserType from "#modules/user/types/user_types";
import User from "#modules/user/models/user";
import { pipe } from "fp-ts/lib/function.js";
import * as TE from 'fp-ts/lib/TaskEither.js';

export const generateUserLoginToken = ( user: User ) => {

    return pipe(
        TE.tryCatch(
            () =>  User.accessTokens.create(user),
            (err) => AppErrors.UnhandledError(err, "There was an error.")
        ),
        TE.map( token => token.value?.release() )
    );
}


export const fetchOrCreateNewUser = ( opts: { fullName: string, email: string, password: string } ) => {

    return TE.tryCatch(
        async () => User.firstOrCreate({ email: opts.email },{
            fullName: opts.fullName,
            email: opts.email,
            password: opts.password,
            userType: UserType.Normal
        }),
        (err) => AppErrors.DBError(err, "There was an error signing you up.")
    );
}

export const createNewUser = ( opts: { fullName: string, email: string, password: string } ) => {

    return TE.tryCatch(
        async () => User.create({
            fullName: opts.fullName,
            email: opts.email,
            password: opts.password,
            userType: UserType.Normal
        }),
        (err) => AppErrors.DBError(err, "There was an error signing you up.")
    );
}