import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AppErrors from "#exceptions/app_error";
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from "fp-ts/lib/function.js";

export const basePath = ( filePath: string = '' ) => {

    return path.join( path.dirname(fileURLToPath(import.meta.url)), filePath );
} 


/**
 * Validates that an item exists in the database.
 * * @param queryFn A function that returns a Promise resolving to the item or undefined.
 * @param dbErrorMessage The error message to throw if the database query fails.
 * @param notFoundErrorMessage The error message to throw if the item is not found.
 */
export const validateExists = <T>( opts : { queryFn: () => Promise<T | undefined>, dbErrorMessage: string, notFoundErrorMessage: string }) => {
    return pipe(
        TE.tryCatch(
            opts.queryFn,
            (err) => AppErrors.DBError(err, opts.dbErrorMessage)
        ),
        TE.flatMap(
            TE.fromPredicate(
                (result): result is T => result !== undefined,
                () => AppErrors.ValidationErrorMessage(opts.notFoundErrorMessage)
            )
        )
    );
};