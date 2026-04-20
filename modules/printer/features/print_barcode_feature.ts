import { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { validateProduct } from "#modules/product/tasks/product_tasks";

const rules = type({
    product: 'string & string > 0',
    printer: 'string & string > 0'
});

type ParamsType = typeof rules.infer

export default class PrintBarcodeFeature extends BaseFeature<TError, any> {

    async handle( params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
        return await PrintBarcodeFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain( ( _, data ) => ValidationService.validate({ rules, data }) )
                                        .chainAndStore('product', ( _, data ) => validateProduct(data.product) )

                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }


}