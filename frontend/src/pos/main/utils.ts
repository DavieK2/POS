import type { Product, Order, EnrichedItem } from "./types";

export const catalog: Product[] = [
  { id: 1,  barcode: "000001", name: "Organic Hass Avocado",     category: "Produce",   unit: "each",   price: 3200, img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=200" },
  { id: 2,  barcode: "000002", name: "Organic Valley Mozzarella",category: "Dairy",     unit: "450 g",  price: 7500, img: "https://images.unsplash.com/photo-1628815870980-f416105d89b3?auto=format&fit=crop&q=80&w=200" },
  { id: 3,  barcode: "000003", name: "Garden Fresh Strawberries", category: "Produce",   unit: "500 g",  price: 3800, img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=200" },
  { id: 4,  barcode: "000004", name: "Whole Organic Milk",        category: "Dairy",     unit: "2 L",    price: 4200, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200" },
  { id: 5,  barcode: "000005", name: "Sourdough Bread",           category: "Bakery",    unit: "loaf",   price: 2800, img: "https://images.unsplash.com/photo-1585478259715-4ddc5572f0e7?auto=format&fit=crop&q=80&w=200" },
  { id: 6,  barcode: "000006", name: "Free Range Eggs",           category: "Dairy",     unit: "12 pk",  price: 2500, img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=200" },
  { id: 7,  barcode: "000007", name: "Cold Brew Coffee",          category: "Beverages", unit: "500 ml", price: 5500, img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=200" },
  { id: 8,  barcode: "000008", name: "Granola Bar Pack",          category: "Snacks",    unit: "6 bars", price: 3600, img: "https://images.unsplash.com/photo-1490567674331-8a29f0cbfe5a?auto=format&fit=crop&q=80&w=200" },
  { id: 9,  barcode: "000009", name: "Cherry Tomatoes",           category: "Produce",   unit: "250 g",  price: 1800, img: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&q=80&w=200" },
  { id: 10, barcode: "000010", name: "Greek Yogurt",              category: "Dairy",     unit: "400 g",  price: 3900, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=200" },
  { id: 11, barcode: "000011", name: "Sparkling Water",           category: "Beverages", unit: "1 L",    price: 1200, img: "https://images.unsplash.com/photo-1606168094336-48f205bfc3b4?auto=format&fit=crop&q=80&w=200" },
  { id: 12, barcode: "000012", name: "Dark Chocolate Bar",        category: "Snacks",    unit: "100 g",  price: 2200, img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=200" },
];

export const paymentOptions = [
  { id: "cash"     as const, label: "Cash",     icon: `<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M6 12H6.01M18 12H18.01"/>` },
  { id: "card"     as const, label: "Card",     icon: `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>` },
  { id: "transfer" as const, label: "Transfer", icon: `<path d="M7 17L17 7M17 7H7M17 7v10"/>` },
];

export const fmt = (n: number): string =>
  "₦" + Number(n).toLocaleString("en-NG");

export const getProduct = (id: number): Product | undefined =>
  catalog.find((p) => p.id === id);

export const orderItems = (o: Order): EnrichedItem[] =>
  o.items
    .map((i) => ({ ...i, product: getProduct(i.productId)! }))
    .filter((i) => i.product != null);

export const orderSub = (o: Order): number =>
  orderItems(o).reduce((s, i) => s + i.product.price * i.qty, 0);

export const orderTotal = (o: Order): number =>
  Math.max(0, orderSub(o) - (o.discount ?? 0));