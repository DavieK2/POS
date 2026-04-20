import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { uploadImage, validateImage, validateProduct } from "../tasks/product_tasks.ts";
import { createCanvas } from 'canvas';
import JSBarcode from 'jsbarcode';
import { pipe } from "fp-ts/lib/function.js";
import { dbq } from "#config/db";
import ResponseMessage from "#services/response_message";

const rules = type({
    product: 'string & string > 0'
});

type ParamsType = typeof rules.infer

export default class GenerateBarcodeFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType  & Auth ): Promise<E.Either<TError, any>> {
         return await GenerateBarcodeFeature.use<typeof params, typeof params>(params)
                                            // .withAuth()
                                            .chain( (_, data) => ValidationService.validate({ rules, data }) )
                                            .chain( (_, data) => validateProduct( data.product ) )
                                            .chainAndStore('barcode', (_, __) => this.generateBarcode() )
                                            .chainAndStore("barcodeImage", (barcode, __ ) => this.generateBarcodeImage(barcode) )
                                            .chainAndStore("uploadPath", (image, _) => this.uploadBarcodeImage( image ) )
                                            .chain( (_, data) => this.updateBarcodeImagePathToProduct({
                                                productId: data.product,
                                                barcode: data.__barcode,
                                                barcodePath: data.__uploadPath
                                            }))
                                            .chain((_,__) => ResponseMessage.successMessage("Barcode successfully generated") )
                                            .catchErrors()
                                            .handle<TError>({
                                                'Default': (err: TError) => TE.left(err),
                                            })
                                            .run();
    }

    generateBarcode(){

        let code = '580';

        while (code.length < 12) {
            code += Math.floor(Math.random() * 10);
        }

        let sum = 0;

        for (let i = 0; i < 12; i++) {
            sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        
        return TE.right( 
            (code + checkDigit).toString() 
        );
    }

    generateBarcodeImage( barcode: string ){
        return E.tryCatch(
            () => {
                const canvas = createCanvas(200, 100);
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                JSBarcode(canvas, barcode, {
                    format: 'EAN13',
                    displayValue: true,
                    fontSize: 18,
                    margin: 10
                });

                return canvas.toDataURL('image/png');
            },
            (err) => AppErrors.HandledError(err, "There was an error generating the barcode")
        )
    }

    uploadBarcodeImage( image: string ){

        return pipe(
            TE.fromEither( validateImage(image) ),
            TE.flatMap( validatedImage => uploadImage(validatedImage, 'products') )
        )
    }

    updateBarcodeImagePathToProduct( opts: { productId: string, barcode: string, barcodePath: string } ){

        return TE.tryCatch(
            () => dbq.updateTable("products")
                     .set({
                        barcode: opts.barcode,
                        barcodeImage: opts.barcodePath
                     })
                     .where("id", '=', opts.productId)
                     .executeTakeFirstOrThrow(),
            (err) => AppErrors.DBError(err, "There was an error saving the barcode")
        )
    }


}