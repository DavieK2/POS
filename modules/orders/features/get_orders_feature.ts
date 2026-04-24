import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js'; // Add this import
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import { dbq } from "#config/db";
import { Expression, sql, SqlBool } from "kysely";

const rules = type({
    query: "string>0 | (string>0)[] > 0",
    search: "string > 0",
    dateFrom: "string > 0",
    dateTo: "string > 0",
    limit: type("number").optional(),
    offset: type("number").optional()
});

type ParamsType = typeof rules.infer

export default class GetOrdersFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth): Promise<E.Either<TError, any>> {
        return await GetOrdersFeature.use<typeof params, typeof params>(params)
            .chain((_, data) => this.getOrders(data))
            .catchErrors()
            .handle<TError>({
                'Default': (err: TError) => TE.left(err),
            })
            .run();
    }

    getOrders(data: ParamsType) {

        const statuses = Array.isArray(data.query) ? data.query : [data.query];

        return pipe(
            TE.tryCatch(
                async () => {

                    const toDbFormat = (date: Date) => date.toISOString().replace('Z', '+00:00')

                    let query =  dbq.selectFrom("orders")
                                    .where('status', 'in', statuses)
                                    .selectAll()
                                    .orderBy('createdAt', 'desc');
                                    
                    if (data.search) query = query.where('orderId', '=', data.search);
                    if (data.limit) query = query.limit(data.limit);
                    if (data.offset) query = query.offset(data.offset);


                    if (data.dateFrom) {
                        const d = new Date(data.dateFrom)
                        d.setUTCHours(0, 0, 0, 0)
                        const start = toDbFormat(d)
                        d.setUTCDate(d.getUTCDate() + 1)
                        const end = toDbFormat(d)

                        query = query .where('createdAt', '>=', start).where('createdAt', '<', end)
                    }

                    return await query.execute();
                },
                (err) => AppErrors.DBError(err, "Error fetching orders")
            ),
            TE.map(orders =>
                orders.map(order => ({
                    ...order,
                    items: order.items ? JSON.parse(order.items) : []
                }))
            )
        );
    }
}