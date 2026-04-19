import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { commitDBTrasaction, startDBTrasaction } from "../../../app/tasks/base_tasks.ts";
import ResponseMessage from "#services/response_message";
import { v7 } from "uuid";
import { DateTime } from "luxon";
import { ControlledTransaction } from "kysely";
import { DB } from "#database/db_shema";

const rules = type({
    categoryName: 'string & string > 0',
});

type ParamsType = typeof rules.infer

export default class AddCategoryFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
         return await AddCategoryFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain({
                                            action: (_, data) => ValidationService.validate({ rules, data })
                                        })
                                        .chainAsyncAndStore('dbTransaction', (_,__) => startDBTrasaction() )
                                        .chain({
                                            action: (_, data) => this.addNewCategory({ categoryName: data.categoryName, dbTransaction: data.__dbTransaction })
                                        })
                                        .chainAsync((_,data) => commitDBTrasaction( data.__dbTransaction ))
                                        .chain((_,__) => ResponseMessage.successMessage("Category successfuy created") )
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    addNewCategory =  ( opts: { categoryName: string, dbTransaction: ControlledTransaction<DB, []> } ) => {

    return TE.tryCatch(
        ()  =>  opts.dbTransaction.insertInto("categories").values({
                    id: v7(),
                    categoryName: opts.categoryName,
                    createdAt: DateTime.now().toString(),
                    updatedAt: DateTime.now().toString()
                }).execute(),
        (err) => AppErrors.DBError(err, "There was an error adding the category.")
    );
}

}