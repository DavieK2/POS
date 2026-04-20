<script lang="ts">
  import { showToast } from "../../../lib/toast";
  import { BASE_URL } from "../../../utils";
  import type { Product } from "../main/types";

    interface BarcodeScanResult {
        scannedCode: string;
        productName?: string;
        productCategory?: string;
        productPrice?: number;
    }
 
    let { currentProduct, onBarcodeGenerated, closeGenerateBarcodeModal } : {
        currentProduct: Product,
        onBarcodeGenerated : (e: { message: string }) => void
        closeGenerateBarcodeModal : () => void
    } = $props()

    let barcodeGenerationMode = $state<'scan' | 'manual'>('manual');
    let scannedBarcodeData = $state<BarcodeScanResult | null>(null);


      // Handle barcode scan simulation (replace with actual scanner integration)
    async function handleBarcodeScan(): Promise<void> {
        // await new Promise(resolve => setTimeout(resolve, 1500));
        // scannedBarcodeData = {
        //   scannedCode: `890${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        //   productName: currentProduct?.name,
        //   productCategory: currentProduct?.category,
        //   productPrice: currentProduct?.price
        // };
    }

  function handleApplyScannedBarcode(): void {
    // if (!currentProduct || !scannedBarcodeData) return;
    // const product = currentProduct;
    // const scanData = scannedBarcodeData;
    // const index = products.findIndex(p => p.id === product.id);
    
    // if (index !== -1) {
    //   products[index] = {
    //     ...products[index],
    //     barcode: scanData.scannedCode,
    //     name: scanData.productName || products[index].name,
    //     category: scanData.productCategory || products[index].category,
    //     price: scanData.productPrice || products[index].price
    //   };
    // }
    // closeGenerateBarcodeModal();
  }

  const handleGenerateBarcodeManually = async () : Promise<void> => {
    
    if (!currentProduct) return;

    const req = await fetch(`${BASE_URL}/product/generate-barcode/${currentProduct.id}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }
    });

    if( ! req.ok ){

      const res = await req.json();
      console.log( res );
      showToast(res.message)
      return;

    }
    const res = await req.json();

    onBarcodeGenerated({ message: res.message })
  }


</script>

<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closeGenerateBarcodeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeGenerateBarcodeModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-barcode-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="generate-barcode-modal-title" class="text-lg font-semibold text-black">Generate Barcode</h2>
        <button
          onclick={closeGenerateBarcodeModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <div class="mb-6">
          <p class="text-sm text-neutral-600 mb-1">Product</p>
          <p class="font-medium text-black">{currentProduct.productName}</p>
          <p class="text-sm text-neutral-500">{currentProduct.productName} • {currentProduct.category}</p>
        </div>

        <div class="flex rounded-xl border border-neutral-200 p-1 bg-neutral-50 mb-6">
          <button
            type="button"
            onclick={() => barcodeGenerationMode = 'scan'}
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 {barcodeGenerationMode === 'scan' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'}"
          >
            <span class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"/><path d="M7 16v-4M11 16v-8M15 16v-6M19 16v-2"/>
              </svg>
              Scan Barcode
            </span>
          </button>
          <button
            type="button"
            onclick={() => barcodeGenerationMode = 'manual'}
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 {barcodeGenerationMode === 'manual' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'}"
          >
            <span class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/>
              </svg>
              Generate from Server
            </span>
          </button>
        </div>

        {#if barcodeGenerationMode === 'scan'}
          <div class="space-y-4">
            <div class="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50">
              {#if scannedBarcodeData}
                <div class="text-center">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p class="font-mono text-lg font-semibold text-black mb-1">{scannedBarcodeData.scannedCode}</p>
                  <p class="text-sm text-neutral-500">Barcode scanned successfully</p>
                </div>
              {:else}
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 text-neutral-400">
                    <path d="M3 3v18h18"/><path d="M7 16v-4M11 16v-8M15 16v-6M19 16v-2"/>
                  </svg>
                  <p class="text-neutral-600 mb-4">Position the barcode within the frame to scan</p>
                  <button
                    onclick={handleBarcodeScan}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Start Scanning
                  </button>
                  <p class="text-xs text-neutral-400 mt-3">Note: Connect a barcode scanner device or use camera API for production</p>
                </div>
              {/if}
            </div>

            {#if scannedBarcodeData}
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 class="font-medium text-blue-900 mb-2">Scanned Details</h4>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                  <dt class="text-blue-700">Code:</dt>
                  <dd class="font-mono text-blue-900">{scannedBarcodeData.scannedCode}</dd>
                  {#if scannedBarcodeData.productName}
                    <dt class="text-blue-700">Name:</dt>
                    <dd class="text-blue-900">{scannedBarcodeData.productName}</dd>
                  {/if}
                  {#if scannedBarcodeData.productCategory}
                    <dt class="text-blue-700">Category:</dt>
                    <dd class="text-blue-900">{scannedBarcodeData.productCategory}</dd>
                  {/if}
                  {#if scannedBarcodeData.productPrice}
                    <dt class="text-blue-700">Price:</dt>
                    <!-- <dd class="text-blue-900">₹{formatCurrency(scannedBarcodeData.productPrice)}</dd> -->
                  {/if}
                </dl>
              </div>
            {/if}
          </div>
        {:else}
          <div class="space-y-4">
            <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <p class="text-sm text-neutral-600">
                A unique barcode will be generated from our backend server and assigned to this product.
              </p>
            </div>

            <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p class="text-sm text-blue-800">
                Generated barcodes follow the EAN-13 standard and are globally unique.
              </p>
            </div>
          </div>
        {/if}

        <div class="flex gap-3 pt-6">
          <button
            type="button"
            onclick={closeGenerateBarcodeModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Cancel
          </button>
          {#if barcodeGenerationMode === 'scan'}
            <button
              onclick={handleApplyScannedBarcode}
              disabled={!scannedBarcodeData}
              class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Barcode
            </button>
          {:else}
            <button
              onclick={handleGenerateBarcodeManually}
              class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
            >
              Generate Barcode
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>