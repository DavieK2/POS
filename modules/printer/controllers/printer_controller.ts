import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import GetPrintersFeature from "../features/get_printers_feature.ts";
import { Get } from "@adonisjs-community/girouette";

export default class PrinterController extends BaseController {
    
    @Get('/printers')
    async getPrinters() {
        return this.process( new GetPrintersFeature )
    }
}