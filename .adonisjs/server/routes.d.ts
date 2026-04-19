import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'authentication.sign_in': { paramsTuple?: []; params?: {} }
    'category.get_categories': { paramsTuple?: []; params?: {} }
    'category.add_category': { paramsTuple?: []; params?: {} }
    'category.update_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'category.delete_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'products.get_products': { paramsTuple?: []; params?: {} }
    'products.add_product': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'category.get_categories': { paramsTuple?: []; params?: {} }
    'products.get_products': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
  }
  POST: {
    'authentication.sign_in': { paramsTuple?: []; params?: {} }
    'category.add_category': { paramsTuple?: []; params?: {} }
    'products.add_product': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'category.update_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
  }
  DELETE: {
    'category.delete_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}