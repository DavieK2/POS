<script lang="ts">
  import type { Product } from "../../../shared/types";
  import { formatCurrency } from "../../../utils";

    let { closeViewProductModal: closeViewProductModal, currentProduct } : {
        currentProduct: Product
        closeViewProductModal: () => void
    } = $props()
</script>

<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in max-h-[95vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-barcode-modal-title"
      tabindex="-1"
      onclick={ (e) => e.stopPropagation() }
      onkeydown={ (e) => e.stopPropagation() }
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="view-barcode-modal-title" class="text-lg font-semibold text-black">Product Details</h2>
        <button
          onclick={closeViewProductModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6 max-h-[80vh] w-full overflow-y-auto">
        <!-- Product header -->
        <div class="flex items-start gap-4 mb-6 pb-6 border-b border-neutral-100">
          <div class="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-600">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" x2="7.01" y1="7" y2="7"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-black text-lg leading-tight">{currentProduct.productName}</h3>
            <p class="text-sm text-neutral-500 font-mono mt-0.5">{currentProduct.productCode}</p>
          </div>
          <span class="inline-flex px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium border border-neutral-200 flex-shrink-0">{currentProduct.category}</span>
        </div>

        <!-- Product details grid -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <p class="text-xs text-neutral-500 mb-1 font-medium uppercase tracking-wider">Price</p>
            <p class="text-xl font-bold text-black">&#8358{formatCurrency(currentProduct.price)}</p>
          </div>
          <div class="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <p class="text-xs text-neutral-500 mb-1 font-medium uppercase tracking-wider">Stock</p>
            <p class="text-xl font-bold text-black">{currentProduct.quantity}</p>
            <p class="text-xs text-neutral-400">units available</p>
          </div>
        </div>

        <!-- Barcode section -->
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider">Barcode (EAN-13)</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
              Generated
            </span>
          </div>
          <div class="flex items-end justify-center gap-0.5 mb-2">
            <img src={currentProduct.barcodeImage} alt="barcode" class="h-32 rounded-lg border border-gray-200">
          </div>
        </div>

        <div class="flex gap-3">
          <button
            onclick={() => {
              if (currentProduct?.barcode) {
                navigator.clipboard.writeText(currentProduct.barcode);
                alert('Barcode copied to clipboard!');
              }
            }}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Copy Barcode
          </button>
        </div>
      </div>
    </div>
  </div>