import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { validateCategory } from "../tasks/product_tasks.ts";
import { dbq } from "#config/db";
import ResponseMessage from "#services/response_message";

const rules = type({
    categoryId: 'string & string > 0',
    categoryName: 'string & string > 0',
});

type ParamsType = typeof rules.infer

export default class UpdateCategoryFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
          return await UpdateCategoryFeature.use<typeof params, typeof params>(params)
                                            .withAuth()
                                            .chain((_,data) => ValidationService.validate({ data, rules }))
                                            .chain( (_,data) => validateCategory( data.categoryId ) )
                                            .chain( (_,data) => this.updateCategory( data ) )
                                            .chain((_,__) => ResponseMessage.successMessage("Category successfully updated") )
                                            .catchErrors()
                                            .handle<TError>({
                                                'Default': (err: TError) => TE.left(err),
                                            })
                                            .run();
    }


    updateCategory =  ( opts: { categoryId: string , categoryName: string }) => { 
        return  TE.tryCatch(
            () => dbq.updateTable("categories")
                     .set({ categoryName: opts.categoryName })
                     .where("id", "=", opts.categoryId )
                     .executeTakeFirst(),
            (err) => AppErrors.DBError(err, "There was an error updating the category.")
        )
    }
}