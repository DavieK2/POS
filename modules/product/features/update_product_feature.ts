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
    product: 'string & string > 0',
    productName: 'string & string > 0',
    category: 'string & string > 0',
    price: 'number',
    quantity: type('number').optional(),
    description: type('string').optional()
});

type ParamsType = typeof rules.infer

export default class UpdateProductFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
        return await UpdateProductFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain( (_, data) => ValidationService.validate({ rules, data }))
                                        .chain( (_, data) => validateProduct( data.product ) )
                                        .chain( (_, data) => this.updateProduct(data) )
                                        .chain( (_,__) => ResponseMessage.successMessage("Product successfully updated"))
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    updateProduct( opts : ParamsType ) {
        return TE.tryCatch(
            () => dbq.updateTable("products")
                     .set({
                        categoryId: opts.category,
                        description: opts.description,
                        productName: opts.productName,
                        price: opts.price,
                        quantity: opts.quantity
                     })
                     .where("id", '=', opts.product)
                     .executeTakeFirst(),
            (err) => AppErrors.DBError(err, "There was an error updating this product")
        )
    }
    
}