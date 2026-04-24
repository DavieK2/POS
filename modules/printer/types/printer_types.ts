export interface PrintData { 
    printer: string, 
    pageSize: string, 
    logoPath?: string, 
    data: { 
        storeName: string,
        address: string,
        date: string,
        transactionId: string,
        paymentMode: string,
        printedBy: string,
        items: Array<{ name: string, unitPrice: number, qty: number }>, 
        subtotal: number,
        discount: number,
        total: number 
    } 
}