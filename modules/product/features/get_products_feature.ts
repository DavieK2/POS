import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import { dbq } from "#config/db";
import { sql } from "kysely";

const rules = type({});

type ParamsType = typeof rules.infer

export default class GetProductsFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth): Promise<E.Either<TError, any>> {
         return await GetProductsFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain((_,__) => this.getProducts() )
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    getProducts = () => {
        return TE.tryCatch(
            () => dbq.selectFrom("products")
                     .leftJoin("categories", "products.categoryId", "categories.id")
                     .selectAll('products')
                     .select(() => sql<string>`${process.env.APP_URL} || products.product_image`.as('productImage') )
                     .select("categories.categoryName as category")
                     .execute(),
            (err) => AppErrors.DBError(err, "There was an error fetching products")
        )
    }
}