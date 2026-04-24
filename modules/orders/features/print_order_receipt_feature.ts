import { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.ts";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { formatOrderReceiptForPrinting, validateOrder } from "../tasks/order_tasks.ts";
import { getWindowsPrinters, printReceipt, validateIsValidPrinter } from "#modules/printer/tasks/printer_tasks";
import os from "node:os"
import ResponseMessage from "#services/response_message";

const rules = type({
    orderId: 'string & string > 0',
    printer: 'string & string > 0',
    pageSize: 'string & string > 0',
});

type ParamsType = typeof rules.infer

export default class PrintReceiptFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
         return await PrintReceiptFeature.use<typeof params, typeof params>(params)
                                        .chain( (_, data) => ValidationService.validate({ rules, data }))
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
                                        .chainAndStore('validPrinter', (_, data) => validateIsValidPrinter({ printers: data.__printers!, printer: data.printer }))
                                        .chain( (_, data) => validateOrder(data.orderId))
                                        .chain( ( order, data) => formatOrderReceiptForPrinting({ order, printer: data.printer, pageSize: data.pageSize }))
                                        .chain( ( data, _) => printReceipt(data) )
                                        .chain( (_,__) => ResponseMessage.successMessage("Printing receipt"))
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    
    

}