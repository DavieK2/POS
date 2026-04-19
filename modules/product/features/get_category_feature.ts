import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import { dbq } from "#config/db";

const rules = type({});

type ParamsType = typeof rules.infer

export default class GetCategoryFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
         return await GetCategoryFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain((_,__) => this.getCategories() )
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    getCategories = () => {
        return TE.tryCatch(
            () => dbq.selectFrom("categories").selectAll().execute(),
            (err) => AppErrors.DBError(err, "There was an error fetching categories")
        )
    }
}