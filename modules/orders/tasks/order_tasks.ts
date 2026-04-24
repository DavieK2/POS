import { dbq } from '#config/db';
import AppErrors from '#exceptions/app_error';
import * as TE from 'fp-ts/lib/TaskEither.js';
import env from '#start/env';
import { Order } from '../types/order_types.ts';
import { PrintData } from '#modules/printer/types/printer_types';


export const validateOrder = (orderId: string) => {
    return TE.tryCatch(
        async () => {
            const result = await dbq
                .selectFrom("orders")
                .innerJoin("users", "users.id", "orders.userId")
                .where("orders.id", "=", orderId)
                .select([
                    "orders.id",
                    "orders.orderId",
                    "orders.discount",
                    "orders.note",
                    "orders.paymentMethod",
                    "orders.items"
                ])
                .select([
                    "users.fullName as printedBy"
                ])
                .executeTakeFirstOrThrow();

            return {
                ...result,
                items: result.items === null ? [] : JSON.parse(result.items)
            } as Order;
        },
        (err) => AppErrors.DBError(err, "Could not get this order")
    );
};
export const orderSubtotal = (o: Order): number => o.items.reduce((acc, item) => acc + (item.price * item.qty), 0)

export const orderTotal = (o: Order): number => orderSubtotal(o) - (isNaN(parseFloat(o.discount)) ? 0 : parseFloat(o.discount))

export const formatOrderReceiptForPrinting = ( p: {order: Order & { printedBy: string }, printer: string, pageSize: string}) => {

    const subtotal = orderSubtotal(p.order);
    const total = orderTotal(p.order);
    
    return TE.right({
        printer: p.printer,
        pageSize: "RECEIPT(80mm x 297mm)",
        data: {
            storeName: env.get("COMPANY"),
            address: env.get("ADDRESS"),
            date: new Date().toLocaleString(),
            transactionId: p.order.orderId,
            paymentMode: p.order.paymentMethod,
            printedBy: p.order.printedBy,
            items: p.order.items.map(item => ({
                name: item.productName,
                unitPrice: item.price,
                qty: item.qty
            })),
            subtotal: subtotal ,
            discount: isNaN(parseFloat(p.order.discount)) ? 0 : parseFloat(p.order.discount),
            total: total
        }
    } as PrintData )
}