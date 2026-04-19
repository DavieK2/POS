import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import GetProductsFeature from "../features/get_products_feature.ts";
import AddProductFeature from "../features/add_product_feature.ts";
import { Delete, Get, Patch, Post } from "@adonisjs-community/girouette";
import UpdateProductFeature from "../features/update_product_feature.ts";
import DeleteProductFeature from "../features/delete_product_feature.ts";

export default class ProductsController extends BaseController {
    
    @Get('/products')
    async getProducts({ request } : HttpContext ) {
        return this.process( new GetProductsFeature, { ...request.all() } )
    }

    @Post('/product')
    async addProduct( { request } : HttpContext) {
        return this.process( new AddProductFeature, { ...request.all() })
    }

    @Patch('/product/update/:product')
    async updateProduct( { request } : HttpContext) {
        return this.process( new UpdateProductFeature, { ...request.all(), ...request.params() })
    }

    @Delete('/product/delete/:product')
    async deleteProduct( { request } : HttpContext) {
        return this.process( new DeleteProductFeature, { ...request.params() })
    }
}