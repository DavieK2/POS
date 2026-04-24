import AppErrors, { ValidationErrorMessage } from '#exceptions/app_error';
import pdfToPrinter, { Printer } from 'pdf-to-printer';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as A from 'fp-ts/lib/Array.js';
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipe } from 'fp-ts/lib/function.js';
import { PrintData } from '../types/printer_types.ts';
import { formatCurrency } from '../../../app/tasks/base_tasks.ts';

const execAsync = promisify(exec);

export const getWindowsPrinters = () => {
    return TE.tryCatch(
        () => pdfToPrinter.getPrinters(),
        (err) => AppErrors.HandledError(err, "Could not fetch printers")
    )
}

export const validateIsValidPrinter = (p: { printers: Printer[], printer: string }): TE.TaskEither<ValidationErrorMessage, Printer> => {
    return pipe(
        p.printers,
        A.findFirst(printer => printer.deviceId === p.printer),
        TE.fromOption(() => AppErrors.ValidationErrorMessage("Invalid Printer"))
    );
}

export const WindowsBinaryDriver = {
    getPrinter: (printerName: string) => {
        return { name: printerName.replace('printer:', '') };
    },

    getPrinters: () => {
        return [];
    },

    printDirect: async (options: {
        data: Buffer;
        printer: string;
        type: string;
        success?: (jobId: number) => void;
        error?: (err: Error) => void;
    }) => {
        const cleanName = options.printer.replace('printer:', '');
        const escapedName = cleanName.replace(/'/g, "''");
        const tempFile = path.resolve(`print_${Date.now()}.bin`);

        try {
            const { stdout } = await execAsync(
                `powershell -NoProfile -Command "$p = Get-WmiObject -Class Win32_Printer -Filter 'Name=''${escapedName}'''; if (-not $p) { Write-Output 'NOT_FOUND' } elseif (-not $p.Shared) { Write-Output 'NOT_SHARED' } else { Write-Output 'SHARED' }"`
            );
            const status = stdout.trim();
            if (status === 'NOT_FOUND') {
                throw new Error(`Printer "${cleanName}" not found.`);
            }
            if (status === 'NOT_SHARED') {
                throw new Error(`Printer "${cleanName}" is not shared. Please enable printer sharing in Windows.`);
            }

            fs.writeFileSync(tempFile, options.data);
            await execAsync(`copy /B "${tempFile}" "\\\\localhost\\${cleanName}"`);

            if (options.success) {
                options.success(1);
            }
            return "Success";
        } catch (err: any) {
            const error = new Error(`Windows Spooler Error: ${err.message}`);
            if (options.error) {
                options.error(error);
            }
            throw error;
        } finally {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    }
};

export function printReceipt(p: PrintData) {
    return TE.tryCatch(
        async () => {
            const printer = new ThermalPrinter({
                type: PrinterTypes.EPSON,
                interface: 'printer:' + p.printer,
                driver: WindowsBinaryDriver,
                width: 42,
            });

            printer.alignCenter();
            printer.setTextSize(1, 1);
            printer.println(p.data.storeName.toUpperCase());

            printer.alignLeft();
            printer.setTextNormal();
            printer.println(p.data.address);
            printer.println(`Date: ${p.data.date}`);
            printer.println(`ID:   ${p.data.transactionId}`);
            printer.println(`Mode: ${p.data.paymentMode} | By: ${p.data.printedBy}`);
            printer.drawLine();

            printer.leftRight("ITEM/DESCRIPTION", "PRICE");
            printer.drawLine();

            p.data.items.forEach(item => {
                const lineTotal = item.unitPrice * item.qty;
                printer.leftRight(
                    `${item.name.substring(0, 24).toUpperCase()}`,
                    formatCurrency(lineTotal, false)
                );
                printer.println(`  ${formatCurrency(item.unitPrice, false)} x ${item.qty}`);
            });

            printer.drawLine();

            printer.leftRight("Subtotal:", formatCurrency(p.data.subtotal, false));
            printer.leftRight("Discount:", `-${formatCurrency(p.data.discount, false)}`);
            printer.bold(true);
            printer.leftRight("TOTAL:", `${formatCurrency(p.data.total, false)}`);
            printer.bold(false);

            printer.alignCenter();
            printer.println(`Total Items: ${p.data.items.length}`);
            printer.println("Thank you!");

            printer.cut();

            await printer.execute();
        },
        (err) => AppErrors.HandledError(err, "There was an error printing")
    )
}