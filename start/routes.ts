/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthenticationController from '#modules/auth/controllers/authentication_controller'
import { createCanvas } from 'canvas';
import JSBarcode from 'jsbarcode';

router.get('/', async () => {

     
        const canvas = createCanvas(200, 100);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Barcode
        JSBarcode(canvas, '123456789012', {
            format: 'EAN13',
            displayValue: true,
            fontSize: 18,
            margin: 10
        });

        // return canvas.toDataURL('image/png');

    // const canvas = new Canvas(600, 600);
    // JSBarcode(canvas, '123456789012', {
    //     format: 'EAN13',
    //     displayValue: true,
    //     fontSize: 18,
    //     height: 100,
    //     width: 2,
    //     margin: 10
    // });

    // const buffer = canvas.toDataURL('image/png');
    return '<img src="' + canvas.toDataURL('image/png') + '" alt="Generated Barcode" />';  
})

router.post('/auth/login', [AuthenticationController, 'signIn']);

// router.get('/products', )
// router


// const express = require('express');
// const cors = require('cors');
// const pdfToPrinter = require('pdf-to-printer');
// const pdfmake = require('pdfmake');
// const vfsFonts = require('pdfmake/build/vfs_fonts');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const { exec } = require('child_process');
// const util = require('util');

// const execAsync = util.promisify(exec);
// const app = express();
// app.use(cors({ origin: true }));
// app.use(express.json({ limit: '1mb' }));

// // 🛠️ FIX 2: Convert Base64 VFS strings to Buffers for Node.js
// const fonts = {
//   Roboto: {
//     normal: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
//     bold: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
//     italics: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
//     bolditalics: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
//   }
// };
// const pdfPrinter = new pdfmake(fonts); // Renamed to avoid confusion

// const TEMP_DIR = path.join(os.tmpdir(), 'pos-print-temp');
// if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// // 🔍 List available printers
// app.get('/printers', async (req, res) => {
//   try {
//     if (os.platform() === 'win32') {
//       const printers = await pdfToPrinter.getPrinters();
//       res.json(printers.map(p => p.name || p.deviceId)); 
//     } else {
//       const { stdout } = await execAsync('lpstat -p');
//       const printers = stdout.split('\n')
//         .filter(Boolean)
//         .map(line => line.match(/^printer\s+(.+?)\s/)?.[1])
//         .filter(Boolean);
//       res.json(printers);
//     }
//   } catch (err) {
//     console.error('Printer detection failed:', err);
//     res.status(500).json({ error: 'Failed to list printers' });
//   }
// });

// // 🖨️ Silent print receipt
// app.post('/print', async (req, res) => {
//   // 🛠️ FIX 1: Rename the incoming printer variable to 'targetPrinter'
//   const { printer: targetPrinter, receipt } = req.body;
//   if (!targetPrinter || !receipt) return res.status(400).json({ error: 'Missing printer or receipt data' });

//   let pdfPath;
//   try {
//     // 1. Generate PDF (80mm thermal width, auto height)
//     const docDefinition = {
//       pageSize: { width: 227, height: 'auto' }, // 80mm ≈ 227pt
//       pageMargins: [10, 10, 10, 10],
//       defaultStyle: { font: 'Roboto', fontSize: 10 },
//       content: [
//         { text: 'VINE POS', alignment: 'center', fontSize: 14, bold: true, margin: [0, 0, 0, 2] },
//         { text: `Order #${receipt.id}`, alignment: 'center', fontSize: 10, margin: [0, 2] },
//         { text: receipt.date, alignment: 'center', fontSize: 9, color: '#666', margin: [0, 2] },
//         { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 207, y2: 5, lineWidth: 0.5, dash: { length: 3 } }], margin: [0, 6] },
//         {
//           table: {
//             widths: ['*', 'auto', 'auto'],
//             body: receipt.items.map(item => [
//               { text: item.name, fontSize: 10 },
//               { text: `×${item.qty}`, alignment: 'center', fontSize: 10 },
//               { text: `₦${(item.price * item.qty).toLocaleString()}`, alignment: 'right', fontSize: 10 }
//             ])
//           },
//           margin: [0, 4]
//         },
//         { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 207, y2: 5, lineWidth: 0.5, dash: { length: 3 } }], margin: [0, 6] },
//         { text: `Total: ₦${receipt.total.toLocaleString()}`, alignment: 'right', fontSize: 12, bold: true, margin: [0, 6] },
//         { text: 'Thank you!', alignment: 'center', fontSize: 9, color: '#666', margin: [0, 12] }
//       ]
//     };

//     const pdfDoc = pdfPrinter.createPdfKitDocument(docDefinition);
//     pdfPath = path.join(TEMP_DIR, `receipt-${Date.now()}.pdf`);
//     const stream = fs.createWriteStream(pdfPath);
//     pdfDoc.pipe(stream);
//     pdfDoc.end();

//     await new Promise((resolve, reject) => {
//       stream.on('finish', resolve);
//       stream.on('error', reject);
//     });

//     // 2. Print silently to selected printer
//     if (os.platform() === 'win32') {
//       await pdfToPrinter.print(pdfPath, { printer: targetPrinter });
//     } else {
//       // macOS / Linux CUPS
//       await execAsync(`lp -d "${targetPrinter}" -o media=Custom.80x999mm "${pdfPath}"`);
//     }

//     res.json({ success: true, printer: targetPrinter });
//   } catch (err) {
//     console.error('Print failed:', err);
//     res.status(500).json({ error: err.message || 'Printing failed' });
//   } finally {
//     // 🛠️ FIX 3: Safe cleanup to prevent crashing on Windows file lock delays
//     if (pdfPath && fs.existsSync(pdfPath)) {
//       try {
//         fs.unlinkSync(pdfPath);
//       } catch (cleanupErr) {
//         console.warn(`Could not immediately delete temp file ${pdfPath}. It may be locked by the print spooler.`);
//       }
//     }
//   }
// });

// const PORT = 3001;
// app.listen(PORT, '127.0.0.1', () => {
//   console.log(`🖨️  POS Print Server → http://127.0.0.1:${PORT}`);
// });