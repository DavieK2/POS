import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { validateProduct } from "#modules/product/tasks/product_tasks";
import { getWindowsPrinters, validateIsValidPrinter } from "../tasks/printer_tasks.ts";
import ResponseMessage from "#services/response_message";
import os from "node:os";
import pdfToPrinter from "pdf-to-printer";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import fs from "node:fs";
import path from "node:path";

const rules = type({
    product: 'string & string > 0',
    printer: 'string & string > 0',
    width: 'number',
    height: 'number',
    paperSize: 'string & string > 0',
    quantity: 'number'
});

type ParamsType = typeof rules.infer

export default class PrintBarcodeFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth): Promise<E.Either<TError, any>> {
        return await PrintBarcodeFeature.use<typeof params, typeof params>(params)
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
                                        .chainAndStore('validPrinter', (_, data) => validateIsValidPrinter({ printers: data.__printers!, printer: data.printer }))
                                        .chain((_, data) => this.printBarcode({
                                            barcode: data.__product.barcode!,
                                            printer: data.__validPrinter.deviceId,
                                            barcodeHeight: data.height,
                                            barcodeWidth: data.width,
                                            pageSize: data.paperSize,
                                            quantity: data.quantity
                                        }))
                                        .chain( (message, _) => ResponseMessage.successMessage(message))
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

   
    printBarcode(p: { barcode: string; printer: string, pageSize: string, barcodeHeight: number, barcodeWidth: number, quantity: number }): TE.TaskEither<TError, string> {
        return TE.tryCatch(
            async () => {
                const filePath = path.join(os.tmpdir(), `barcode-${Date.now()}.pdf`);

                const canvas = createCanvas((72*p.barcodeWidth), (72*p.barcodeHeight), 'pdf');
                const ctx = canvas.getContext('2d')
                ctx.fillStyle = '#000000'
                ctx.font = 'bold'
                ctx.imageSmoothingEnabled = false;

                JsBarcode(canvas, p.barcode, {
                    format: "EAN13",
                    lineColor: "#000000",
                    background:"#ffffff",
                    width: 1.5,
                    height: 60,
                    displayValue: true,
                    fontSize: 16,
                    xmlDocument: false
                });

                await new Promise<void>((resolve, reject) => {
                    const out = fs.createWriteStream(filePath);
                    const stream = canvas.createPDFStream();
                    stream.pipe(out);
                    out.on('finish', resolve);
                    out.on('error', reject);
                    stream.on('error', reject);
                });

                await pdfToPrinter.print(filePath, {
                    printer: p.printer,
                    paperSize: p.pageSize,
                    monochrome: true,
                    copies: p.quantity,
                    orientation: "landscape"
                    
                });

                fs.unlink(filePath, () => {});

                return `Barcode ${p.barcode} printed successfully`;
            },
            (err) => AppErrors.HandledError(err, "There was an error printing")
        );
    }
}