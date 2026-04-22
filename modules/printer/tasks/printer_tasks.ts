import AppErrors from '#exceptions/app_error';
import pdfToPrinter from 'pdf-to-printer';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { createCanvas, loadImage } from 'canvas';
import fs from "node:fs";
import path from "node:path";
import os from "node:os";


export const getWindowsPrinters = () => {

    return TE.tryCatch(
        () => pdfToPrinter.getPrinters(),
        (err) => AppErrors.HandledError(err, "Could not fetch printers")
    )

}

export async function generateReceiptStream(p: { 
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
}) {
    // 1. UNIT ADJUSTMENT: 226 points = ~80mm width.
    const WIDTH = 226; 
    const MARGIN = 12;
    
    // Dynamic height calculation (Units are smaller now)
    const headerHeight = p.logoPath ? 160 : 100; 
    const itemHeight = p.data.items.length * 35; // Each item block is ~35pts
    const footerHeight = 150;
    const dynamicHeight = headerHeight + itemHeight + footerHeight;

    // Create canvas in PDF mode
    const canvas = createCanvas(WIDTH, dynamicHeight, 'pdf');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';

    let currentY = 15;

    // --- 1. Logo ---
    if (p.logoPath && fs.existsSync(p.logoPath)) {
        try {
            const logo = await loadImage(p.logoPath);
            const logoWidth = 60; // Smaller logo for 80mm width
            const logoHeight = (logo.height / logo.width) * logoWidth;
            ctx.drawImage(logo, (WIDTH / 2) - (logoWidth / 2), currentY, logoWidth, logoHeight);
            currentY += logoHeight + 10;
        } catch (e) {
            console.error("Logo failed to load, skipping.");
        }
    }

    // --- 2. Header ---
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(p.data.storeName.toUpperCase(), WIDTH / 2, currentY);
    currentY += 18;

    ctx.font = '9px Arial';
    ctx.fillText(p.data.address, WIDTH / 2, currentY);
    currentY += 25;

    // --- 3. Metadata (Monospace for alignment) ---
    ctx.textAlign = 'left';
    ctx.font = '8px Courier New';
    ctx.fillText(`Date: ${p.data.date}`, MARGIN, currentY);
    ctx.fillText(`ID:   ${p.data.transactionId}`, MARGIN, currentY + 10);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Mode: ${p.data.paymentMode}`, WIDTH - MARGIN, currentY);
    ctx.fillText(`By:   ${p.data.printedBy}`, WIDTH - MARGIN, currentY + 10);
    currentY += 30;

    // Dashed Divider
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(MARGIN, currentY);
    ctx.lineTo(WIDTH - MARGIN, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    currentY += 10;

    // --- 4. Items Table ---
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText("ITEM / DESCRIPTION", MARGIN, currentY);
    ctx.textAlign = 'right';
    ctx.fillText("TOTAL", WIDTH - MARGIN, currentY);
    currentY += 15;

    ctx.font = '9px Courier New';
    p.data.items.forEach(item => {
        // Item Name
        ctx.textAlign = 'left';
        ctx.font = 'bold 9px Courier New';
        ctx.fillText(item.name.substring(0, 24).toUpperCase(), MARGIN, currentY);
        
        // Price breakdown
        currentY += 10;
        ctx.font = '9px Courier New';
        const lineTotal = item.unitPrice * item.qty;
        ctx.textAlign = 'left';
        ctx.fillText(`${item.unitPrice.toLocaleString()} x ${item.qty}`, MARGIN + 5, currentY);
        
        ctx.textAlign = 'right';
        ctx.fillText(lineTotal.toLocaleString(), WIDTH - MARGIN, currentY);
        currentY += 18; 
    });

    // --- 5. Summary ---
    ctx.beginPath();
    ctx.moveTo(MARGIN, currentY);
    ctx.lineTo(WIDTH - MARGIN, currentY);
    ctx.stroke();
    currentY += 10;

    const summaryX = WIDTH * 0.45;
    const drawLine = (label: string, val: string, isBold = false) => {
        ctx.font = isBold ? 'bold 11px Courier New' : '9px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(label, summaryX, currentY);
        ctx.textAlign = 'right';
        ctx.fillText(val, WIDTH - MARGIN, currentY);
        currentY += isBold ? 15 : 12;
    };

    drawLine("Subtotal:", p.data.subtotal.toLocaleString());
    drawLine("Discount:", `-${p.data.discount.toLocaleString()}`);
    currentY += 5;
    drawLine("TOTAL:", `N${p.data.total.toLocaleString()}`, true);

    // --- 6. Footer ---
    currentY += 20;
    ctx.textAlign = 'center';
    ctx.font = '8px Arial';
    ctx.fillText(`Total Items: ${p.data.items.length}`, WIDTH / 2, currentY);
    currentY += 15;
    ctx.font = 'italic 9px Arial';
    ctx.fillText("Thank you for your business!", WIDTH / 2, currentY);

    // --- 7. Save and Print ---
    const filePath = path.join(os.tmpdir(), `receipt-${Date.now()}.pdf`);
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPDFStream();
    
    await new Promise((resolve, reject) => {
        stream.pipe(out);
        out.on('finish', resolve);
        out.on('error', reject);
    });

    await pdfToPrinter.print(filePath, {
        scale: 'noscale',
        paperSize: p.pageSize,
        monochrome: true,
        copies: 1
    });

    fs.unlink(filePath, () => {});
}