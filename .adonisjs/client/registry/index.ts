/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'authentication.sign_in': {
    methods: ["POST"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['authentication.sign_in']['types'],
  },
  'printer.get_printers': {
    methods: ["GET"],
    pattern: '/printers',
    tokens: [{"old":"/printers","type":0,"val":"printers","end":""}],
    types: placeholder as Registry['printer.get_printers']['types'],
  },
  'printer.print_barcode': {
    methods: ["POST"],
    pattern: '/print/barcode/:product',
    tokens: [{"old":"/print/barcode/:product","type":0,"val":"print","end":""},{"old":"/print/barcode/:product","type":0,"val":"barcode","end":""},{"old":"/print/barcode/:product","type":1,"val":"product","end":""}],
    types: placeholder as Registry['printer.print_barcode']['types'],
  },
  'category.get_categories': {
    methods: ["GET"],
    pattern: '/categories',
    tokens: [{"old":"/categories","type":0,"val":"categories","end":""}],
    types: placeholder as Registry['category.get_categories']['types'],
  },
  'category.add_category': {
    methods: ["POST"],
    pattern: '/category',
    tokens: [{"old":"/category","type":0,"val":"category","end":""}],
    types: placeholder as Registry['category.add_category']['types'],
  },
  'category.update_category': {
    methods: ["PATCH"],
    pattern: '/category/update/:categoryId',
    tokens: [{"old":"/category/update/:categoryId","type":0,"val":"category","end":""},{"old":"/category/update/:categoryId","type":0,"val":"update","end":""},{"old":"/category/update/:categoryId","type":1,"val":"categoryId","end":""}],
    types: placeholder as Registry['category.update_category']['types'],
  },
  'category.delete_category': {
    methods: ["DELETE"],
    pattern: '/category/delete/:categoryId',
    tokens: [{"old":"/category/delete/:categoryId","type":0,"val":"category","end":""},{"old":"/category/delete/:categoryId","type":0,"val":"delete","end":""},{"old":"/category/delete/:categoryId","type":1,"val":"categoryId","end":""}],
    types: placeholder as Registry['category.delete_category']['types'],
  },
  'products.get_products': {
    methods: ["GET"],
    pattern: '/products',
    tokens: [{"old":"/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.get_products']['types'],
  },
  'products.add_product': {
    methods: ["POST"],
    pattern: '/product',
    tokens: [{"old":"/product","type":0,"val":"product","end":""}],
    types: placeholder as Registry['products.add_product']['types'],
  },
  'products.update_product': {
    methods: ["PATCH"],
    pattern: '/product/update/:product',
    tokens: [{"old":"/product/update/:product","type":0,"val":"product","end":""},{"old":"/product/update/:product","type":0,"val":"update","end":""},{"old":"/product/update/:product","type":1,"val":"product","end":""}],
    types: placeholder as Registry['products.update_product']['types'],
  },
  'products.delete_product': {
    methods: ["DELETE"],
    pattern: '/product/delete/:product',
    tokens: [{"old":"/product/delete/:product","type":0,"val":"product","end":""},{"old":"/product/delete/:product","type":0,"val":"delete","end":""},{"old":"/product/delete/:product","type":1,"val":"product","end":""}],
    types: placeholder as Registry['products.delete_product']['types'],
  },
  'products.generate_product_barcode': {
    methods: ["POST"],
    pattern: '/product/generate-barcode/:product',
    tokens: [{"old":"/product/generate-barcode/:product","type":0,"val":"product","end":""},{"old":"/product/generate-barcode/:product","type":0,"val":"generate-barcode","end":""},{"old":"/product/generate-barcode/:product","type":1,"val":"product","end":""}],
    types: placeholder as Registry['products.generate_product_barcode']['types'],
  },
  'products.search_products_by_barcode': {
    methods: ["GET"],
    pattern: '/products/search/barcode',
    tokens: [{"old":"/products/search/barcode","type":0,"val":"products","end":""},{"old":"/products/search/barcode","type":0,"val":"search","end":""},{"old":"/products/search/barcode","type":0,"val":"barcode","end":""}],
    types: placeholder as Registry['products.search_products_by_barcode']['types'],
  },
  'products.search_products_by_product_name': {
    methods: ["GET"],
    pattern: '/products/search',
    tokens: [{"old":"/products/search","type":0,"val":"products","end":""},{"old":"/products/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['products.search_products_by_product_name']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
