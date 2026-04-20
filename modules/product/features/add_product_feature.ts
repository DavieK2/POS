import AppErrors, { TError } from "#exceptions/app_error";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import BaseFeature from "../../../app/contracts/base_feature.js";
import { Auth } from "#services/pipeline_builder";
import { type } from "arktype";
import ValidationService from "#services/validation_services";
import { commitDBTrasaction, startDBTrasaction } from "../../../app/tasks/base_tasks.ts";
import ResponseMessage from "#services/response_message";
import { v7 } from "uuid";
import { ControlledTransaction } from "kysely";
import { DB } from "#database/db_shema";
import ImageUpload, { ValidatedImage } from "#services/image_upload";

const rules = type({
    productName: 'string & string > 0',
    category: 'string & string > 0',
    price: 'number',
    quantity: type('number').optional(),
    description: type('string').optional(),
    image: type('string').optional()
});

type ParamsType = typeof rules.infer

export default class AddProductFeature extends BaseFeature<TError, any> {

    async handle(params: ParamsType & Auth ): Promise<E.Either<TError, any>> {
          return await AddProductFeature.use<typeof params, typeof params>(params)
                                        // .withAuth()
                                        .chain( (_, data) => ValidationService.validate({ data, rules }) )
                                        .chainAsyncAndStore('dbTransaction', (_,__) => startDBTrasaction() )
                                        .chainWhenAndStore({
                                            storeKey: 'validatedImage',
                                            condition: (_, data) => !!data.image,
                                            action : ( _, data ) => this.validateImage( data.image! ),
                                        })
                                        .chainWhenAndStore({
                                            storeKey: 'imageUrl',
                                            condition: (_, data) => !!data.image,
                                            action : ( _, data ) => this.uploadImage( data.__validatedImage! )
                                        })
                                        .chain((_, data) => this.addNewProduct({
                                            ...data,
                                            image: data.__imageUrl,
                                            dbTransaction: data.__dbTransaction
                                        }))
                                        .chainAsync( (_, data) => commitDBTrasaction( data.__dbTransaction ) )
                                        .chain( (_,__) => ResponseMessage.successMessage("Product added successfully") )
                                        .catchErrors()
                                        .handle<TError>({
                                            'Default': (err: TError) => TE.left(err),
                                        })
                                        .run();
    }

    validateImage( image: string ) {
        return E.tryCatch(
            () => ImageUpload.validateBase64Image(image),
            () => AppErrors.ValidationErrorMessage("The provided image is not valid")
        )
    }

    uploadImage( image: ValidatedImage ) {
        return TE.tryCatch(
            () => ImageUpload.save( image, 'products' ),
            (err) => AppErrors.UnhandledError(err, "There was an error uploading the product image")
        )
    }

    addNewProduct = ( opts: ParamsType & { dbTransaction: ControlledTransaction<DB, []>  }) => {
    
        const productCode : string = btoa( Math.random().toString() ).substring(15, 25).toUpperCase();

        return TE.tryCatch(
            () => opts.dbTransaction.insertInto("products").values({
                id: v7(),
                productName: opts.productName,
                productCode: productCode,
                price: opts.price,
                quantity: opts.quantity,
                description: opts.description,
                categoryId: opts.category,
                productImage: opts.image
            }).execute(),
            (err) => AppErrors.DBError(err, "There was an error adding this product")
        );
    }
}