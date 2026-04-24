import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import SignInUserFeature from "../features/sign_in_user_feature.js";
import { Get, Middleware, Post } from "@adonisjs-community/girouette";
import { middleware } from "#start/kernel";
import SignOutFeature from "../features/sign_out_feature.ts";
import GetAuthUserFeature from "../features/get_auth_user_feature.ts";

export default class AuthenticationController extends BaseController {
    
    @Post('/auth/login')
    async signIn( { request } : HttpContext ) {
        return this.process( new SignInUserFeature, { ...request.all(), ...request.params(), ipAddress: request.ip() });
    }

    @Get('/auth/me')
    @Middleware([ middleware.auth({ guards: ['api'] }) ])
    async getAuthUser(  { auth } : HttpContext ){
        return this.process( new GetAuthUserFeature, { auth } )
    }

    @Post('/auth/logout')
    @Middleware([ middleware.auth({ guards: ['api'] }) ])
    async signOut(  { auth } : HttpContext ){
        return this.process( new SignOutFeature, { auth } )
    }



}