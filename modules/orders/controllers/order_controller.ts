import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import CreateOrderFeature from "../features/create_order_feature.ts";
import GetOrdersFeature from "../features/get_orders_feature.ts";
import UpdateOrderFeature from "../features/update_order_feature.ts";
import { Get, GroupMiddleware, Patch, Post } from "@adonisjs-community/girouette";
import { middleware } from "#start/kernel";
import PrintReceiptFeature from "../features/print_order_receipt_feature.ts";

@GroupMiddleware([ middleware.auth({ guards: ['api'] }) ])
export default class OrderController extends BaseController {
    
    @Get('/orders')
    async getOrders ( { auth, request } : HttpContext ) {
       return this.process( new GetOrdersFeature, { auth, ...request.all(), } )
    }

    @Post('/order/create')
    async createOrder ( { auth } : HttpContext ) {
       return this.process( new CreateOrderFeature, { auth } )
    }

    @Patch('/order/update/:order')
    async updateOrder ( { request, auth } : HttpContext ) {
       return this.process( new UpdateOrderFeature, { ...request.all(), auth, ...request.params() } )
    }

   @Post('/order/print')
    async printOrder ( { request, auth } : HttpContext ) {
       return this.process( new PrintReceiptFeature, { ...request.all(), auth, ...request.params() } )
    }

}