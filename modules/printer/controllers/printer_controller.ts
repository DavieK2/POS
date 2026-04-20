import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import GetPrintersFeature from "../features/get_printers_feature.ts";
import { Get, Post } from "@adonisjs-community/girouette";
import PrintBarcodeFeature from "../features/print_barcode_feature.ts";

export default class PrinterController extends BaseController {
    
    @Get('/printers')
    async getPrinters() {
        return this.process( new GetPrintersFeature )
    }

    @Post('/print/barcode/:product')
    async printBarcode( { request } : HttpContext ){
        return this.process( new PrintBarcodeFeature, { ...request.all(), ...request.params() })
    }
}