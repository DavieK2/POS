/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'authentication.sign_in': {
    methods: ["POST"]
    pattern: '/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/auth/controllers/authentication_controller').default['signIn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/auth/controllers/authentication_controller').default['signIn']>>>
    }
  }
  'authentication.get_auth_user': {
    methods: ["GET"]
    pattern: '/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/auth/controllers/authentication_controller').default['getAuthUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/auth/controllers/authentication_controller').default['getAuthUser']>>>
    }
  }
  'authentication.sign_out': {
    methods: ["POST"]
    pattern: '/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/auth/controllers/authentication_controller').default['signOut']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/auth/controllers/authentication_controller').default['signOut']>>>
    }
  }
  'order.get_orders': {
    methods: ["GET"]
    pattern: '/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['getOrders']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['getOrders']>>>
    }
  }
  'order.create_order': {
    methods: ["POST"]
    pattern: '/order/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['createOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['createOrder']>>>
    }
  }
  'order.update_order': {
    methods: ["PATCH"]
    pattern: '/order/update/:order'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { order: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['updateOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['updateOrder']>>>
    }
  }
  'order.print_order': {
    methods: ["POST"]
    pattern: '/order/print'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['printOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/orders/controllers/order_controller').default['printOrder']>>>
    }
  }
  'printer.get_printers': {
    methods: ["GET"]
    pattern: '/printers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/printer/controllers/printer_controller').default['getPrinters']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/printer/controllers/printer_controller').default['getPrinters']>>>
    }
  }
  'printer.print_barcode': {
    methods: ["POST"]
    pattern: '/print/barcode/:product'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { product: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/printer/controllers/printer_controller').default['printBarcode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/printer/controllers/printer_controller').default['printBarcode']>>>
    }
  }
  'category.get_categories': {
    methods: ["GET"]
    pattern: '/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['getCategories']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['getCategories']>>>
    }
  }
  'category.add_category': {
    methods: ["POST"]
    pattern: '/category'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['addCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['addCategory']>>>
    }
  }
  'category.update_category': {
    methods: ["PATCH"]
    pattern: '/category/update/:categoryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { categoryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['updateCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['updateCategory']>>>
    }
  }
  'category.delete_category': {
    methods: ["DELETE"]
    pattern: '/category/delete/:categoryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { categoryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['deleteCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/category_controller').default['deleteCategory']>>>
    }
  }
  'products.get_products': {
    methods: ["GET"]
    pattern: '/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['getProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['getProducts']>>>
    }
  }
  'products.add_product': {
    methods: ["POST"]
    pattern: '/product'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['addProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['addProduct']>>>
    }
  }
  'products.update_product': {
    methods: ["PATCH"]
    pattern: '/product/update/:product'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { product: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['updateProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['updateProduct']>>>
    }
  }
  'products.delete_product': {
    methods: ["DELETE"]
    pattern: '/product/delete/:product'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { product: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['deleteProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['deleteProduct']>>>
    }
  }
  'products.generate_product_barcode': {
    methods: ["POST"]
    pattern: '/product/generate-barcode/:product'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { product: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['generateProductBarcode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['generateProductBarcode']>>>
    }
  }
  'products.search_products_by_barcode': {
    methods: ["GET"]
    pattern: '/products/search/barcode'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['searchProductsByBarcode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['searchProductsByBarcode']>>>
    }
  }
  'products.search_products_by_product_name': {
    methods: ["GET"]
    pattern: '/products/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['searchProductsByProductName']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#modules/product/controllers/products_controller').default['searchProductsByProductName']>>>
    }
  }
}
