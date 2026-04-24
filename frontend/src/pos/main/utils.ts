import type {  Order } from "./types";

export const paymentOptions = [
  { id: "cash"     as const, label: "Cash",     icon: `<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M6 12H6.01M18 12H18.01"/>` },
  { id: "card"     as const, label: "Card",     icon: `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>` },
  { id: "transfer" as const, label: "Transfer", icon: `<path d="M7 17L17 7M17 7H7M17 7v10"/>` },
];

export const fmt = (n: number): string => {
  
    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: "NGN",
        minimumFractionDigits: 2
    });

    return formatter.format(n)
}

export const orderSubtotal = (o: Order): number => o.items.reduce((acc, item) => acc + (item.price * item.qty), 0)

export const orderTotal = (o: Order): number => orderSubtotal(o) - o.discount

export const formatDate = ( d: string) => {

  const formatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC'
  })

  
  return formatter.format(new Date(d))
}