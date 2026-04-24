import { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.ts";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";

const rules = type({});

type ParamsType = typeof rules.infer

export default class GetAuthUserFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
         return await GetAuthUserFeature.use<typeof params, typeof params>(params)
                                    .withAuth()
                                    .chain( (_, data) => TE.right({
                                        user: {
                                            fullName: data.__user.fullName,
                                            username: data.__user.userName,
                                            role: data.__user.role
                                        },
                                        
                                    }))
                                    .catchErrors()
                                    .handle<TError>({
                                        'Default': (err: TError) => TE.left(err),
                                    })
                                    .run();
    }

}