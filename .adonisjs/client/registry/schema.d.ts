/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'authentication.sign_in': {
    methods: ["POST"]
    pattern: '/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
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
}
