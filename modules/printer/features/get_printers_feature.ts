import { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import os from "node:os"
import ResponseMessage from "#services/response_message";
import { getWindowsPrinters } from "../tasks/printer_tasks.ts";

const rules = type({});

type ParamsType = typeof rules.infer

export default class GetPrintersFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
         return await GetPrintersFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chainWhenAndStore({
                                            'storeKey': 'printers',
                                            condition: (_,__) => os.platform() === 'win32',
                                            action: (_,__) => getWindowsPrinters()
                                        })
                                        .chainIfElse({
                                            condition: (_, data) => !! data.__printers,
                                            onFalse: () => ResponseMessage.successMessage("No printers found"),
                                            onTrue: (_, data) => TE.right(data.__printers)
                                        })
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }
}