import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import GetProductsFeature from "../features/get_products_feature.ts";
import AddProductFeature from "../features/add_product_feature.ts";
import { Get, Post } from "@adonisjs-community/girouette";

export default class ProductsController extends BaseController {
    
    @Get('/products')
    async getProducts({ request } : HttpContext ) {
        return this.process( new GetProductsFeature, { ...request.all() } )
    }

    @Post('/product')
    async addProduct( { request } : HttpContext) {
        return this.process( new AddProductFeature, { ...request.all() })
    }
}