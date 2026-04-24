import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'authentication.sign_in': { paramsTuple?: []; params?: {} }
    'authentication.get_auth_user': { paramsTuple?: []; params?: {} }
    'authentication.sign_out': { paramsTuple?: []; params?: {} }
    'order.get_orders': { paramsTuple?: []; params?: {} }
    'order.create_order': { paramsTuple?: []; params?: {} }
    'order.update_order': { paramsTuple: [ParamValue]; params: {'order': ParamValue} }
    'order.print_order': { paramsTuple?: []; params?: {} }
    'printer.get_printers': { paramsTuple?: []; params?: {} }
    'printer.print_barcode': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
    'category.get_categories': { paramsTuple?: []; params?: {} }
    'category.add_category': { paramsTuple?: []; params?: {} }
    'category.update_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'category.delete_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'products.get_products': { paramsTuple?: []; params?: {} }
    'products.add_product': { paramsTuple?: []; params?: {} }
    'products.update_product': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
    'products.delete_product': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
    'products.generate_product_barcode': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
    'products.search_products_by_barcode': { paramsTuple?: []; params?: {} }
    'products.search_products_by_product_name': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'authentication.get_auth_user': { paramsTuple?: []; params?: {} }
    'order.get_orders': { paramsTuple?: []; params?: {} }
    'printer.get_printers': { paramsTuple?: []; params?: {} }
    'category.get_categories': { paramsTuple?: []; params?: {} }
    'products.get_products': { paramsTuple?: []; params?: {} }
    'products.search_products_by_barcode': { paramsTuple?: []; params?: {} }
    'products.search_products_by_product_name': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  POST: {
    'authentication.sign_in': { paramsTuple?: []; params?: {} }
    'authentication.sign_out': { paramsTuple?: []; params?: {} }
    'order.create_order': { paramsTuple?: []; params?: {} }
    'order.print_order': { paramsTuple?: []; params?: {} }
    'printer.print_barcode': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
    'category.add_category': { paramsTuple?: []; params?: {} }
    'products.add_product': { paramsTuple?: []; params?: {} }
    'products.generate_product_barcode': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
  }
  PATCH: {
    'order.update_order': { paramsTuple: [ParamValue]; params: {'order': ParamValue} }
    'category.update_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'products.update_product': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
  }
  DELETE: {
    'category.delete_category': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'products.delete_product': { paramsTuple: [ParamValue]; params: {'product': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}