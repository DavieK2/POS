import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import { dbq } from "#config/db";
import { sql } from "kysely";

const rules = type({
    search: type('string > 0').optional(),
    filter: type('string > 0').optional(),
    limit: type('number').optional(),
    offset: type('number').optional(),
});

type ParamsType = typeof rules.infer

export default class GetProductsFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth): Promise<E.Either<TError, any>> {
         return await GetProductsFeature.use<typeof params, typeof params>(params)
                                        .withAuth()
                                        .chain((_, data) => this.getProducts(data))
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    getProducts = ( q: { search?: string, filter?: string, limit?: number, offset?: number}) => {
        return TE.tryCatch(
            async () => {
                const limit = q?.limit ?? 10;
                const offset = q?.offset ?? 0;
                const baseUrl = `${process.env.APP_URL}/products`;

                // ─── Build filtered base query ───
                let baseQuery = dbq.selectFrom("products")
                     .leftJoin("categories", "products.categoryId", "categories.id")
                     .selectAll('products')
                     .select( () => sql<string>`${process.env.APP_URL} || products.product_image`.as('productImage') )
                     .select( () => sql<string>`${process.env.APP_URL} || products.barcode_image`.as('barcodeImage') )
                     .select("categories.categoryName as category");

                if (q?.search) {
                    baseQuery = baseQuery.where((eb) => eb.or([
                        eb('products.productName', 'like', `%${q.search}%`),
                        eb('products.barcode', 'like', `%${q.search}%`),
                        eb('products.productCode', 'like', `%${q.search}%`)
                    ]));
                }

                if (q?.filter) {
                    baseQuery = baseQuery.where('products.categoryId', '=', q.filter);
                }

                // ─── Get total count ───
                const countResult = await baseQuery
                    .select((eb) => eb.fn.countAll().as('count'))
                    .executeTakeFirst();

                const total = Number(countResult?.count ?? 0);
                const currentPage = Math.floor(offset / limit) + 1;
                const totalPages = Math.ceil(total / limit);

                // ─── Get paginated products ───
                const products = await baseQuery
                    .selectAll('products')
                    .select( () => sql<string>`${process.env.APP_URL} || products.product_image`.as('productImage') )
                    .select( () => sql<string>`${process.env.APP_URL} || products.barcode_image`.as('barcodeImage') )
                    .select("categories.categoryName as category")
                    .limit(limit)
                    .offset(offset)
                    .execute();

                // ─── Build query string helper ───
                const buildQuery = (newOffset: number) => {
                    const p = new URLSearchParams();
                    p.set('limit', String(limit));
                    p.set('offset', String(newOffset));
                    if (q?.search) p.set('search', q.search);
                    if (q?.filter) p.set('filter', q.filter);
                    return `${baseUrl}?${p.toString()}`;
                };

                // ─── Generate page numbers array (max 5 visible) ───
                const maxVisible = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                }
                const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

                return {
                    products,
                    pagination: {
                        total,
                        limit,
                        offset,
                        currentPage,
                        totalPages,
                        hasNextPage: currentPage < totalPages,
                        hasPreviousPage: currentPage > 1,
                        nextPageUrl: currentPage < totalPages ? buildQuery(offset + limit) : null,
                        previousPageUrl: currentPage > 1 ? buildQuery(Math.max(0, offset - limit)) : null,
                        pageNumbers,
                        firstPageUrl: totalPages > 0 ? buildQuery(0) : null,
                        lastPageUrl: totalPages > 0 ? buildQuery((totalPages - 1) * limit) : null,
                    }
                };
            },
            (err) => AppErrors.DBError(err, "There was an error fetching products")
        );
    }
}