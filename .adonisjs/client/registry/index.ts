/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'authentication.sign_in': {
    methods: ["POST"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['authentication.sign_in']['types'],
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
