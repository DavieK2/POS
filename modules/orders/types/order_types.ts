export interface POSProduct {
    id: string;
    productCode: string;
    productName: string;
    category?: string;
    categoryId?: string;
    price: number;
    barcode?: string;
    productImage?: string;
}
export interface ActiveOrderItem extends POSProduct {
    qty: number
}

export interface Order {
  orderId: string | null;
  discount: string;
  note: string | null;
  paymentMethod : string| null;
  items: ActiveOrderItem[];
  printedBy: string
}