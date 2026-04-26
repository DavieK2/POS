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
    query: type("string & string > 0").optional(),
    category: type("string & string > 0").optional(),
    barcode: type("string & string > 0").optional(),
});

type ParamsType = typeof rules.infer

export default class SearchProductsFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
        return await SearchProductsFeature.use<typeof params, typeof params>(params)
                                                .withAuth()
                                                .chain((_, data) => ValidationService.validate({ rules, data }))
                                                .chain( (_, data) => this.searchProduct({query: data.query, category: data.category, barcode: data.barcode }))
                                                .catchErrors()
                                                .handle<TError>({
                                                    'Default': (err: TError) => TE.left(err),
                                                })
                                                .run();
    }

    searchProduct( p: { query?: string, category?: string, barcode?: string } ){

        return TE.tryCatch(
            async () => {
                let query =  dbq.selectFrom("products")
                                .leftJoin("categories", "products.categoryId", "categories.id")
                                .select(['products.id', 'products.barcode', 'products.productName', 'products.productCode', 'products.price', 'products.categoryId'])
                                .select( () => sql<string>`${process.env.APP_URL} || products.product_image`.as('productImage') )
                                .select("categories.categoryName as category")
                if( p.query ){
                    query = query.where('products.productName', 'like', `%${p.query}%`)
                }

                if( p.barcode ){
                    query = query.where('products.barcode', 'like', `%${p.barcode}%`)
                }

                if( p.category ){
                    query = query.where('products.categoryId', '=', `${p.category}`)
                }

                return await query.execute();
                     
            },
            (err) => AppErrors.DBError(err, "There was an error retrieving items")
        )

    }
}