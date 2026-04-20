 <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closePrintBarcodeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closePrintBarcodeModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-barcode-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="print-barcode-modal-title" class="text-lg font-semibold text-black">Print Barcode Labels</h2>
        <button
          onclick={closePrintBarcodeModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handlePrintBarcode(); }} class="p-6 space-y-6">

        <!-- Label preview -->
        <div>
          <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-3">Label Preview</p>
          <div class="flex justify-center">
            <!-- Simulated physical label: ~50mm × 25mm aspect ratio -->
            <div class="relative bg-white border-2 border-neutral-300 rounded-md shadow-md px-4 pt-3 pb-2 w-64" style="font-family: monospace;">
              <!-- Label top: product name + price -->
              <div class="flex items-start justify-between mb-2 gap-2">
                <p class="text-xs font-bold text-black leading-tight truncate flex-1">{currentProduct.productName}</p>
                <p class="text-xs font-bold text-black flex-shrink-0">₹{formatCurrency(currentProduct.price)}</p>
              </div>
              <!-- Category badge -->
              <p class="text-[10px] text-neutral-500 mb-2 uppercase tracking-wider">{currentProduct.category} · {currentProduct.productCode}</p>
              <!-- Barcode bars -->
              <div class="flex items-end justify-center gap-px h-8 mb-1 bg-white">
                <!-- Left guard bars -->
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <!-- Data bars derived from barcode string -->
                {#each currentProduct.barcode.split('') as digit, i}
                  <div class="bg-white" style="width:1px;height:100%"></div>
                  <div
                    class="rounded-sm"
                    style="background:{i % 5 === 0 ? '#000' : i % 3 === 0 ? '#111' : '#000'}; width:{(['0','2','4','6','8'].includes(digit)) ? '3px' : '2px'}; height:{parseInt(digit) % 3 === 0 ? '100%' : parseInt(digit) % 2 === 0 ? '80%' : '65%'}"
                  ></div>
                {/each}
                <!-- Right guard bars -->
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
              </div>
              <!-- Barcode number -->
              <p class="text-center text-[9px] text-neutral-700 tracking-widest font-mono">{currentProduct.barcode}</p>
              <!-- Label corner cut marks -->
              <div class="absolute top-1 left-1 w-2 h-2 border-t border-l border-neutral-400 rounded-tl-sm"></div>
              <div class="absolute top-1 right-1 w-2 h-2 border-t border-r border-neutral-400 rounded-tr-sm"></div>
              <div class="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-neutral-400 rounded-bl-sm"></div>
              <div class="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-neutral-400 rounded-br-sm"></div>
            </div>
          </div>
          <p class="text-center text-xs text-neutral-400 mt-2">50mm × 25mm · EAN-13</p>
        </div>

        <!-- Quantity selector -->
        <div>
          <label for="print-quantity" class="block text-sm font-medium text-neutral-700 mb-2">Number of Labels</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              onclick={() => printQuantity = Math.max(1, printQuantity - 1)}
              class="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
              aria-label="Decrease quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
              </svg>
            </button>
            <input
              id="print-quantity"
              type="number"
              bind:value={printQuantity}
              min="1"
              max="100"
              class="w-16 px-3 py-2 text-center border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white font-medium"
            />
            <button
              type="button"
              onclick={() => printQuantity = Math.min(100, printQuantity + 1)}
              class="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
              aria-label="Increase quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5v14"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-neutral-400 mt-1">Maximum 100 labels per print job</p>
        </div>

        <!-- Print settings -->
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <h4 class="font-medium text-neutral-800 mb-2">Print Settings</h4>
          <ul class="space-y-1.5 text-sm text-neutral-600">
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12"/></svg>
              Label size: 50mm × 25mm
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12"/></svg>
              Format: EAN-13 with human-readable text
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12"/></svg>
              Printer: Default system printer
            </li>
          </ul>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            onclick={closePrintBarcodeModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Print {printQuantity} Label{printQuantity > 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  </div>