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
  }
}
