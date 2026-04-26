import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { dbq } from "#config/db";
import { DateTime } from "luxon";
import ResponseMessage from "#services/response_message";

const Items = type({
    productId: 'string',
    qty: 'number'
}).array().atLeastLength(1)

const rules = type({
    order: "string & string > 0",
    discount: type("string").optional(),
    items: type(Items).optional(),
    note: type("string & string > 0").optional(),
    paymentMethod: type("string & string > 0").optional(),
    status: type("string & string > 0").optional()
});

type ParamsType = typeof rules.infer

type Product = { 
    id: string;
    productCode: string;
    productName: string;
    category?: string;
    categoryId?: string;
    price: number;
    barcode?: string;
    productImage?: string;
 }

type EnrichedItem = Product & {
    qty: number;
};

export default class UpdateOrderFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth): Promise<E.Either<TError, any>> {
         return await UpdateOrderFeature.use<typeof params, typeof params>(params)
                                        .withAuth()
                                        .chain((_, data) => ValidationService.validate({ rules, data }))
                                        .chain((_, data) => this.validateAndFetchProducts(data))
                                        .chainIfElse({
                                            condition: (_, data) => (!! data.items) && data?.items.length > 0,
                                            onTrue: ( items, { __user, auth, ...data }) =>  this.updateOrder({ ...data, items: JSON.stringify(items) }),
                                            onFalse: (_, { __user, auth, items, ...data }) =>  this.updateOrder(data)
                                        })
                                        .chain((_, __) => ResponseMessage.successMessage("Order Updated") )
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    validateAndFetchProducts(data: ParamsType): TE.TaskEither<TError, EnrichedItem[]> {
        if (!data.items || data.items.length === 0) {
            return TE.right([]);
        }

        const productIds = data.items.map(item => item.productId);

        return TE.tryCatch(
            async () => {
                const products =   await dbq.selectFrom("products")
                                            .leftJoin("categories", "products.categoryId", "categories.id")
                                            .select("categories.categoryName as category")
                                            .select([
                                                'products.id', 
                                                'products.productCode', 
                                                'products.productName',
                                                'products.barcode',
                                                'products.categoryId',
                                                'products.price',
                                                'products.productImage',
                                            ])
                                            .where("products.id", "in", productIds)
                                            .execute();

                const productMap = new Map(products.map(p => [p.id, p as Product]));
                const missingIds = productIds.filter(id => !productMap.has(id));

                if (missingIds.length > 0) {
                    throw AppErrors.ValidationErrorMessage(
                        `Products not found: ${missingIds.join(", ")}`
                    );
                }

                return data.items!.map(item => ({
                    qty: item.qty,
                    ...productMap.get(item.productId)!
                }));
            },
            (err) =>  AppErrors.DBError(err, "Failed to validate products")
        );
    }

    updateOrder( order: Omit<ParamsType, 'items'> & { items?: string } ) {
        
        const { order: orderId, ...data } = order;
        return TE.tryCatch(
            () => dbq.updateTable("orders")
                    .where("orders.id", '=', orderId)
                    .set({
                        ...data,
                        updatedAt: DateTime.now().toString()
                    }).executeTakeFirstOrThrow(),
            (err) => AppErrors.DBError(err, "There was an error")
        );
    }
}