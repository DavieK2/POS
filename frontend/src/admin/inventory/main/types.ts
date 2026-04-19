export interface Category {
    id: number;
    categoryName: string;
}

export interface Product {
    id: number;
    productCode: string;
    productName: string;
    category?: string;
    categoryId?: string;
    price: number;
    quantity?: number;
    barcode?: string;
    barcodeImage?: string;
    productImage?: string;
  }


export interface DropDownOptions {
    text: string;
    value: string;
}

export interface ProductFormData {
    name: string;
    price: number;
    category?: string | null;
    description?: string | null;
    quantity?: number | null;
    image?: string | null;
}