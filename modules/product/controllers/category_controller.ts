import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import GetCategoryFeature from "../features/get_category_feature.ts";
import AddCategoryFeature from "../features/add_category_feature.ts";
import { Delete, Get, Patch, Post } from "@adonisjs-community/girouette";
import UpdateCategoryFeature from "../features/update_category_feature.ts";
import DeleteCategoryFeature from "../features/delete_category_feature.ts";

export default class CategoryController extends BaseController {
    
    @Get('/categories')
    async getCategories({ request, auth } : HttpContext ) {
       return this.process( new GetCategoryFeature, { ...request.all(), auth } )
    }

    @Post('/category')
    async addCategory( { request, auth } : HttpContext) {
        return this.process( new AddCategoryFeature, { ...request.all(), auth })
    }

    @Patch('/category/update/:categoryId')
    async updateCategory( { request, auth } : HttpContext) {
        return this.process( new UpdateCategoryFeature, { ...request.all(), ...request.params(), auth })
    }

    @Delete('/category/delete/:categoryId')
    async deleteCategory( { request, auth } : HttpContext) {
        return this.process( new DeleteCategoryFeature, { ...request.params(), auth })
    }
}