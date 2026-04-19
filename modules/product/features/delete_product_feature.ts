import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { validateProduct } from "../tasks/product_tasks.ts";
import { dbq } from "#config/db";
import ResponseMessage from "#services/response_message";

const rules = type({
    productId: 'string & string > 0'
});

type ParamsType = typeof rules.infer

export default class DeleteProductFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
        return await DeleteProductFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain( (_, data) => ValidationService.validate({ rules, data }))
                                        .chain( (_, data) => validateProduct( data.productId ) )
                                        .chain( (_, data) => this.deleteProduct( data.productId ) )
                                        .chain( (_, __) => ResponseMessage.successMessage("Product successfully deleted") )
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    deleteProduct( productId: string ) {
        return TE.tryCatch(
            () => dbq.deleteFrom("products")
                     .where("id", '=', productId)
                     .executeTakeFirst(),
            (err) => AppErrors.DBError(err, "There was an error deleting this product")
        )
    }
    
}