/*
|--------------------------------------------------------------------------
| Girouette routes loader file
|--------------------------------------------------------------------------
|
| DO NOT MODIFY THIS FILE AS IT WILL BE OVERRIDDEN DURING THE BUILD PROCESS
|
| It automatically register your resolvers present in `./modules`.
| You can disable this behavior by removing the `indexControllers` from your `adonisrc.ts`.
|
*/

import girouette from '@adonisjs-community/girouette/services/main'
import app from '@adonisjs/core/services/app'

await girouette.controllers([
  () => import('#modules/auth/controllers/authentication_controller'),
  () => import('#modules/orders/controllers/order_controller'),
  () => import('#modules/printer/controllers/printer_controller'),
  () => import('#modules/product/controllers/category_controller'),
  () => import('#modules/product/controllers/products_controller'),
])

girouette.hmr(app.makePath('./modules'))
