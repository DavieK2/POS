import { GroupMiddleware } from "@adonisjs-community/girouette";
import BaseController from "../../../app/contracts/base_controller.js";
import type { HttpContext } from '@adonisjs/core/http'
import { middleware } from "#start/kernel";

@GroupMiddleware([  middleware.auth({ guards: ['api'] }) ])
export default class UserController extends BaseController {
    
    async getUser({ auth } : HttpContext ) {
       
    }
}