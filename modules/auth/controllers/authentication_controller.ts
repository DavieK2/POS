import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import SignInUserFeature from "../features/sign_in_user_feature.js";

export default class AuthenticationController extends BaseController {
    
    async signIn( { request } : HttpContext ) {
        return this.process( new SignInUserFeature, { ...request.all(), ...request.params(), ipAddress: request.ip() });
    }
}