import { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";

const rules = type();

type ParamsType = typeof rules.infer

export default class CreateOrderFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType ): Promise<E.Either<TError, any>> {
         return await CreateOrderFeature.use<typeof params, typeof params>(params)
                                        .chain()
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

}