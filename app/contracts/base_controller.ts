import { inject } from "@adonisjs/core";
import { HttpContext } from '@adonisjs/core/http'
import BaseFeature from "./base_feature.js";
import * as E from 'fp-ts/lib/Either.js';
import { TError } from "#exceptions/app_error";

@inject()
export default abstract class BaseController {

    constructor( protected http: HttpContext ) {}
   
    async process<E extends TError,A>( feature: BaseFeature<E,A>,  params?: any ) {
        return E.match(
            ( error: E ) => this.http.response.status(error.code ?? 500).json({
                message: error.message,
                ...(error.errors && { errors: error.errors }),
            }),
            ( successValue ) => this.http.response.json( successValue )

        )( await feature.handle( params ) )    
    }
}