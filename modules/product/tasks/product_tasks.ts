import { dbq } from "#config/db";
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