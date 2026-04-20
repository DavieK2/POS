import AppErrors from '#exceptions/app_error';
import pdfToPrinter from 'pdf-to-printer';
import * as TE from 'fp-ts/lib/TaskEither.js';
// import fs from 'node:fs';
// import os from 'node:os';
// import path from "node:path";
// import vfsFonts from 'pdfmake/build/'

// const fonts = {
//   Roboto: {
//     normal: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
//     bold: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
//     italics: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
//     bolditalics: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
//   }
// };
// const pdfPrinter = new pdfmake(fonts);

// const TEMP_DIR = path.join(os.tmpdir(), 'pos-print-temp');
// if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

export const getWindowsPrinters = () => {

    return TE.tryCatch(
        () => pdfToPrinter.getPrinters(),
        (err) => AppErrors.HandledError(err, "Could not fetch printers")
    )

}