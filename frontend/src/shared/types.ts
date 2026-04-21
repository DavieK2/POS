export interface Category {
    id: string;
    categoryName: string;
    productCount?: number
}

export interface Product {
    id: string;
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