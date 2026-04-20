import AppErrors, { TError, ValidationErrorMessage } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as A from 'fp-ts/Array';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { validateProduct } from "#modules/product/tasks/product_tasks";
import { getWindowsPrinters } from "../tasks/printer_tasks.ts";
import ResponseMessage from "#services/response_message";
import os from "node:os"
import { Printer } from "pdf-to-printer";
import { pipe } from "fp-ts/lib/function.js";

const rules = type({
    product: 'string & string > 0',
    printer: 'string & string > 0'
});

type ParamsType = typeof rules.infer

export default class PrintBarcodeFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth): Promise<E.Either<TError, any>> {
        return await PrintBarcodeFeature.use<typeof params, typeof params>(params)
            // .withAuth()
            .chain((_, data) => ValidationService.validate({ rules, data }))
            .chainAndStore('product', (_, data) => validateProduct(data.product))
            .chainWhenAndStore({
                'storeKey': 'printers',
                condition: (_, __) => os.platform() === 'win32',
                action: (_, __) => getWindowsPrinters()
            })
            .chainIfElse({
                condition: (_, data) => !!data.__printers,
                onFalse: () => ResponseMessage.successMessage("Cannot print. No printers found"),
                onTrue: (_, data) => TE.right(data.__printers)
            })
            .chainAndStore('validPrinter', (_, data) => this.validateIsValidPrinter({ printers: data.__printers!, printer: data.printer }))

            .catchErrors()
            .handle<TError>({
                'Default': (err: TError) => TE.left(err),
            })
            .run();
    }


    validateIsValidPrinter(p: { printers: Printer[], printer: string }): TE.TaskEither<ValidationErrorMessage, Printer> {
        return pipe(
            p.printers,
            A.findFirst(printer => printer.deviceId === p.printer),
            TE.fromOption(() => AppErrors.ValidationErrorMessage("Invalid Printer"))
        );
    }

}