import { dbq } from "#config/db";
import AppErrors from "#exceptions/app_error";
import ImageUpload, { ValidatedImage } from "#services/image_upload";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { validateExists } from "../../../helpers.ts";

export const validateCategory = ( categoryId: string ) => {

    return validateExists({
        queryFn: () => dbq.selectFrom("categories")
                         .select('categories.id')
                         .where("categories.id", '=', categoryId )
                         .executeTakeFirst(),
        dbErrorMessage: "There was an error validating the category.",
        notFoundErrorMessage: "Invalid category ID provided."
    });
}

export const validateProduct = ( productId: string ) => {
    return validateExists( {
        queryFn: () => dbq.selectFrom("products").select('products.id').where("products.id", '=', productId ).executeTakeFirst(),
        dbErrorMessage: "There was an error retrieving this product",
        notFoundErrorMessage: "This product is not valid"
    })
}

export const validateImage = ( image: string ) => {
    return E.tryCatch(
        () => ImageUpload.validateBase64Image(image),
        () => AppErrors.ValidationErrorMessage("The provided image is not valid")
    )
}

export const uploadImage = ( image: ValidatedImage, path: string ) => {
    return TE.tryCatch(
        () => ImageUpload.save( image, path ),
        (err) => AppErrors.UnhandledError(err, "There was an error uploading the product image")
    )
}