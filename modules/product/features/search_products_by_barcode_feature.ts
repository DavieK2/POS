import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.ts";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { dbq } from "#config/db";
import { sql } from "kysely";

const rules = type({
    query: "string & string > 0"
});

type ParamsType = typeof rules.infer

export default class SearchProductsByBarcodeFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
        return await SearchProductsByBarcodeFeature.use<typeof params, typeof params>(params)
                                                .withAuth()
                                                .chain((_, data) => ValidationService.validate({ rules, data }))
                                                .chain( (_, data) => this.searchProductProductBarcode(data.query))
                                                .chain( (data, __) => TE.right({
                                                    message: 'Product successfully retrieved',
                                                    product: data
                                                }))
                                                .catchErrors()
                                                .handle<TError>({
                                                    'Default': (err: TError) => TE.left(err),
                                                })
                                                .run();
    }

    searchProductProductBarcode( barcode: string ){

        return TE.tryCatch(
            () => dbq.selectFrom("products")
                     .where('barcode', '=', `${barcode}`)
                     .leftJoin("categories", "products.categoryId", "categories.id")
                     .select(['products.id', 'products.barcode', 'products.productName', 'products.productCode', 'products.price', 'products.categoryId'])
                     .select( () => sql<string>`${process.env.APP_URL} || products.product_image`.as('productImage') )
                     .select("categories.categoryName as category")
                     .executeTakeFirstOrThrow(),
            (err) => AppErrors.DBError(err, "There was an error retrieving items")
        )

    }
}