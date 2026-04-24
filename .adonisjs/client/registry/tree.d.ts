/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  authentication: {
    signIn: typeof routes['authentication.sign_in']
    getAuthUser: typeof routes['authentication.get_auth_user']
    signOut: typeof routes['authentication.sign_out']
  }
  order: {
    getOrders: typeof routes['order.get_orders']
    createOrder: typeof routes['order.create_order']
    updateOrder: typeof routes['order.update_order']
    printOrder: typeof routes['order.print_order']
  }
  printer: {
    getPrinters: typeof routes['printer.get_printers']
    printBarcode: typeof routes['printer.print_barcode']
  }
  category: {
    getCategories: typeof routes['category.get_categories']
    addCategory: typeof routes['category.add_category']
    updateCategory: typeof routes['category.update_category']
    deleteCategory: typeof routes['category.delete_category']
  }
  products: {
    getProducts: typeof routes['products.get_products']
    addProduct: typeof routes['products.add_product']
    updateProduct: typeof routes['products.update_product']
    deleteProduct: typeof routes['products.delete_product']
    generateProductBarcode: typeof routes['products.generate_product_barcode']
    searchProductsByBarcode: typeof routes['products.search_products_by_barcode']
    searchProductsByProductName: typeof routes['products.search_products_by_product_name']
  }
}
