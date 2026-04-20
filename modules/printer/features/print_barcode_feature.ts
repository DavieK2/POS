import AppErrors, { TError, ValidationErrorMessage } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as A from 'fp-ts/lib/Array.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { validateProduct } from "#modules/product/tasks/product_tasks";
import { getWindowsPrinters } from "../tasks/printer_tasks.ts";
import ResponseMessage from "#services/response_message";
import os from "node:os";
import pdfToPrinter, { Printer } from "pdf-to-printer";
import { pipe } from "fp-ts/lib/function.js";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import fs from "node:fs";
import path from "node:path";

const rules = type({
    product: 'string & string > 0',
    printer: 'string & string > 0'
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
                                        .chainAndStore('validPrinter', (_, data) => this.validateIsValidPrinter({ printers: data.__printers!, printer: data.printer }))
                                        // 👇 Wire in the print step
                                        .chain((_, data) => this.printBarcode({
                                            barcode: data.__product.barcode!,
                                            printer: data.__validPrinter.deviceId
                                        }))
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

    /**
     * Generates a barcode PDF and sends it to the specified printer.
     * Wrapped in TaskEither so it fits the fp-ts pipeline.
     */
    printBarcode(p: { barcode: string; printer: string }): TE.TaskEither<TError, string> {
        return TE.tryCatch(
            async () => {
                // 1. Build a temp file path so we don't collide on concurrent prints
                const filePath = path.join(os.tmpdir(), `barcode-${Date.now()}.pdf`);

                // 2. Create canvas with PDF backend (288x144 pts = 4x2 inch label)
                const canvas = createCanvas(288, 144, 'pdf');

                // 3. Draw the barcode onto the canvas
                JsBarcode(canvas, p.barcode, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 2,
                    height: 100,
                    displayValue: true,
                });

                // 4. Write the PDF to the temp file (callback → Promise bridge)
                await new Promise<void>((resolve, reject) => {
                    const out = fs.createWriteStream(filePath);
                    const stream = canvas.createPDFStream();
                    stream.pipe(out);
                    out.on('finish', resolve);
                    out.on('error', reject);
                    stream.on('error', reject);
                });

                // 5. Send to printer
                await pdfToPrinter.print(filePath, {
                    printer: p.printer,  
                    scale: 'noscale',
                    paperSize: '2x4in',
                    monochrome: true
                });

                // 6. Clean up the temp file (fire-and-forget, don't fail the job)
                fs.unlink(filePath, () => {});

                return `Barcode ${p.barcode} printed successfully`;
            },
            // Map any thrown error into your TError shape
            (err) => AppErrors.HandledError(err, "There was an error printing") as TError
        );
    }
}