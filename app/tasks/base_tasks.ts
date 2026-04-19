import { dbq } from "#config/db";
import { DB } from "#database/db_shema";
import AppErrors from "#exceptions/app_error";
import * as TE from "fp-ts/lib/TaskEither.js";
import { ControlledTransaction } from "kysely";

export const startDBTrasaction = () => { 

    return TE.tryCatch(
        ()  => dbq.startTransaction().execute(),
        (e) => AppErrors.UnhandledError(e)
    )()
}

export const commitDBTrasaction = ( transaction: ControlledTransaction<DB, []> ) => { 

    return TE.tryCatch(
        ()  => transaction.commit().execute(),
        (e) => AppErrors.UnhandledError(e)
    )()
}