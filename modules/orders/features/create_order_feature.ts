import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import { dbq } from "#config/db";
import { v7 } from "uuid";
import { DateTime } from "luxon";
import { generateRandomNumber } from "../../../app/tasks/base_tasks.ts";
import User from "#modules/user/models/user";

const rules = type({});

type ParamsType = typeof rules.infer

export default class CreateOrderFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
         return await CreateOrderFeature.use<typeof params, typeof params>(params)
                                        .withAuth()
                                        .chain( (_, data) => this.createOrder(data.__user as unknown as User) )
                                        .chain( (order, _) => TE.right({
                                            orderId: order?.orderId,
                                            id: order?.id

                                        }))
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    createOrder( user: User ){
        return TE.tryCatch(
            () => dbq.insertInto("orders").values({ 
                id: v7(), 
                orderId: generateRandomNumber(6),
                userId: user.id, 
                createdAt: DateTime.now().toString(), 
                updatedAt: DateTime.now().toString()  
            })
            .returning(["id", 'orderId'])
            .executeTakeFirst(),
            (err) => AppErrors.DBError(err, "There was an error creating your order")
        )
    }

}