import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import GetProductsFeature from "../features/get_products_feature.ts";
import AddProductFeature from "../features/add_product_feature.ts";
import { Delete, Get, Patch, Post } from "@adonisjs-community/girouette";
import UpdateProductFeature from "../features/update_product_feature.ts";
import DeleteProductFeature from "../features/delete_product_feature.ts";
import GenerateBarcodeFeature from "../features/generate_barcode_feature.ts";
import SearchProductsBarcodeFeature from "#modules/product/features/search_products_by_barcode_feature";
import SearchProductsFeature from "#modules/product/features/search_products_feature";

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

    @Post('/product/generate-barcode/:product')
    async generateProductBarcode( { request } : HttpContext){
        return this.process( new GenerateBarcodeFeature, { ...request.params() } )
    }

    @Get('/products/search/barcode')
    async searchProductsByBarcode({ request } : HttpContext ) {
        return this.process( new SearchProductsBarcodeFeature, { ...request.all() } )
    }

    @Get('/products/search')
    async searchProductsByProductName({ request } : HttpContext ) {
        return this.process( new SearchProductsFeature, { ...request.all() } )
    }
}