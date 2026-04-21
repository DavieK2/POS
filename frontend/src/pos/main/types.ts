export interface POSProduct {
    id: number;
    productCode: string;
    productName: string;
    category?: string;
    categoryId?: string;
    price: number;
    barcode?: string;
    productImage?: string;
}

export type OrderStatus = "active" | "held";
export type PaymentMethod = "cash" | "card" | "transfer";
export type PastOrderStatus = "paid" | "cancelled";
 
export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  img: string;
}
 
export interface OrderItem {
  productId: number;
  qty: number;
}
 
export interface Order {
  id: string;
  status: OrderStatus;
  discount: number;
  note: string;
  items: OrderItem[];
}
 
export interface PastOrder {
  id: string;
  date: string;
  total: number;
  status: PastOrderStatus;
  method: PaymentMethod | "-";
  items: OrderItem[];
}
 
export interface EnrichedItem extends OrderItem {
  product: Product;
}
 
export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: string;
}

export interface ActiveOrderItem extends POSProduct {
    qty: number
}
 