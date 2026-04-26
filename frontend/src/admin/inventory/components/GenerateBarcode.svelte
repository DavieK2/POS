<script lang="ts">
  import { showToast } from "../../../lib/toast";
  import Button from "../../../shared/button.svelte";
  import type { Product } from "../../../shared/types";
  import { api, BASE_URL } from "../../../utils";
  import { startBarcodeScanner } from "../../../barcode";
  import { onMount, onDestroy } from "svelte";

  interface BarcodeScanResult {
    scannedCode: string;
    productName?: string;
    productCategory?: string;
    productPrice?: number;
  }

  let {
    currentProduct,
    onBarcodeGenerated,
    closeGenerateBarcodeModal,
  }: {
    currentProduct: Product;
    onBarcodeGenerated: (e: { message: string }) => void;
    closeGenerateBarcodeModal: () => void;
  } = $props();

  let barcodeGenerationMode = $state<"scan" | "manual">("manual");
  let scannedBarcodeData = $state<BarcodeScanResult | null>(null);
  let isLoading = $state(false);

  // ── Scanner states ──────────────────────────────────────────────────────────
  let scanning = $state<boolean>(false);
  let scanFlash = $state<boolean>(false);
  let stopScanner: (() => void) | null = null;

  // ── Handle real barcode scan ────────────────────────────────────────────────
  function onBarcodeScanned(barcode: string): void {
    if (!barcode || isLoading) return;
    triggerScanEffect();
    scannedBarcodeData = {
      scannedCode: barcode,
      productName: currentProduct?.productName,
      productCategory: currentProduct?.category,
      productPrice: currentProduct?.price,
    };
  }

  function clearScannedBarcode(): void {
    scannedBarcodeData = null;
    scanFlash = false;
    scanning = false;
  }

  // ── Scan animation ──────────────────────────────────────────────────────────
  function triggerScanEffect(): void {
    if (scanning) return;
    scanning = true;
    setTimeout(() => {
      scanFlash = true;
      setTimeout(() => {
        scanFlash = false;
      }, 1000);
      scanning = false;
    }, 1500);
  }

  const handleGenerateBarcodeManually = async (withCode: boolean): Promise<void> => {
    if (!currentProduct) return;
    if( withCode && ! scannedBarcodeData?.scannedCode ) return
    isLoading = true;

    await api({
      url: `/product/generate-barcode/${currentProduct.id}`,
      method: "POST",
      body: {
        barcode: withCode ? scannedBarcodeData?.scannedCode : undefined
      },
      withAuth: true,
      onSuccess: (res) => {
        onBarcodeGenerated({ message: res.message });
          isLoading = false;
      },
      onFail: (res) => {
        showToast(res.message);
        isLoading = false;
      }
    });
   
  };

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  onMount(() => {
    stopScanner = startBarcodeScanner(onBarcodeScanned);
  });

  onDestroy(() => {
    stopScanner?.();
  });
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
>
  <div class="bg-white rounded-2xl shadow-2xl max-h-[95vh] w-full max-w-lg overflow-hidden animate-scale-in" role="dialog" aria-modal="true" aria-labelledby="generate-barcode-modal-title" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
      <h2 id="generate-barcode-modal-title" class="text-lg font-semibold text-black">Generate Barcode</h2>
      <button onclick={closeGenerateBarcodeModal} class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-6 max-h-[85vh] overflow-y-auto">
      <div class="mb-6">
        <p class="text-sm text-neutral-600 mb-1">Product</p>
        <p class="font-medium text-black">{currentProduct.productName}</p>
        <p class="text-sm text-neutral-500">{currentProduct.productName} • {currentProduct.category}</p>
      </div>

      <div class="flex rounded-xl border border-neutral-200 p-1 bg-neutral-50 mb-6">
        <button type="button" onclick={() => (barcodeGenerationMode = "scan")} class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 {barcodeGenerationMode === 'scan' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'}">
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18" /><path d="M7 16v-4M11 16v-8M15 16v-6M19 16v-2" />
            </svg>
            Scan Barcode
          </span>
        </button>
        <button type="button" onclick={() => (barcodeGenerationMode = "manual", scannedBarcodeData = null)} class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 {barcodeGenerationMode === 'manual' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'}">
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            Generate from Server
          </span>
        </button>
      </div>

      {#if barcodeGenerationMode === "scan"}
        <div class="space-y-4">
          <div class="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center bg-neutral-50 relative overflow-hidden">
            {#if scannedBarcodeData}
              <div class="text-center animate-fade-in">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <!-- Barcode number -->
                <p class="font-mono text-lg font-semibold text-black mb-1">{scannedBarcodeData.scannedCode}</p>
                <p class="text-sm text-neutral-500 mb-4">Barcode scanned successfully</p>

                <!-- Clear button under the barcode number -->
                <button onclick={clearScannedBarcode} class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none" aria-label="Clear scanned barcode">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear Scan
                </button>
              </div>
            {:else}
              <div class="flex flex-col items-center justify-center gap-4">
                <div aria-label={scanning ? "Scanning…" : "Scanner ready"} class="relative shrink-0 rounded-2xl max-w-min min-w-max flex items-center p-5 gap-5 overflow-hidden transition-all duration-500 {scanning ? 'bg-zinc-900' : 'bg-[#0A0A0A]'} {scanFlash ? 'scan-flash' : ''}">
                  <div class="relative w-15 h-15 shrink-0 flex items-center justify-center">
                    <svg class="absolute inset-0 w-full h-full scanner-viewfinder" viewBox="0 0 44 44" fill="none">
                      <path d="M3 13V3h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                      <path d="M41 13V3H31" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                      <path d="M3 31v10h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                      <path d="M41 31v10H31" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                    </svg>

                    <div class="flex items-end justify-center gap-0.5 h-4.5 relative z-10">
                      {#each [7, 4, 7, 3, 6, 4, 5, 7] as h}
                        <div class="barcode-bar bg-white rounded-sm" style="width:2px; height:{h}px"></div>
                      {/each}
                    </div>

                    <div class="scan-line-hero absolute left-1 right-1 h-[1.5px] bg-green-400 rounded-full shadow-[0_0_8px_2px_rgba(74,222,128,0.8)] z-20"></div>
                  </div>

                  <div class="btn-scan-sweep absolute inset-0 pointer-events-none rounded-[14px]"></div>
                </div>

                <div class="flex flex-col items-center gap-1 z-10 relative">
                  <div class="flex items-center gap-1.25">
                    <span class="w-1.25 h-1.25 rounded-full {scanning ? 'bg-green-400 animate-ping' : 'bg-green-400 animate-pulse'}"></span>
                    <span class="text-xs font-medium capitalize tracking-widest {scanning ? 'text-green-300' : 'text-zinc-500'}">
                      {scanning ? "Reading…" : "Scanner ready"}
                    </span>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <p class="text-sm text-neutral-600">A unique barcode will be generated and assigned to this product.</p>
          </div>

          <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 flex-shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <p class="text-sm text-blue-800">Generated barcodes follow the EAN-13 standard and are globally unique.</p>
          </div>
        </div>
      {/if}

      <div class="flex gap-3 pt-6">
        <button type="button" onclick={closeGenerateBarcodeModal} class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Cancel </button>
        {#if barcodeGenerationMode === "scan"}
          <Button label="Apply Barcode" disabled={!scannedBarcodeData} loading={isLoading} onclick={() => handleGenerateBarcodeManually(true)} />
        {:else}
          <Button label="Generate Barcode" loading={isLoading} onclick={() => handleGenerateBarcodeManually(false)} />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* ── Result animations ────────────────────────────────────────────────────── */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }

  /* ── Scan animations ──────────────────────────────────────────────────────── */
  .scan-line-hero {
    animation: sweepHero 0.9s ease-in-out infinite alternate;
  }
  @keyframes sweepHero {
    0% {
      top: 15%;
    }
    100% {
      top: 85%;
    }
  }
  .btn-scan-sweep::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.08) 50%, transparent 100%);
    animation: shimmer 1s ease-in-out infinite;
  }
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .scan-flash {
    animation: flash 0.3s ease-out;
  }
  @keyframes flash {
    0% {
      background-color: #16a34a;
    }
    100% {
      background-color: #0a0a0a;
    }
  }
  .scan-line-hero {
    opacity: 0;
    top: 50%;
    transition:
      opacity 0.3s ease,
      top 0.3s ease;
  }
  .btn-scan-sweep {
    opacity: 0;
    background: linear-gradient(to bottom, transparent, rgba(74, 222, 128, 0.1), transparent);
    transition: opacity 0.5s ease;
  }
  .scanner-viewfinder {
    color: white;
    opacity: 0.8;
    transition:
      color 0.4s ease,
      opacity 0.4s ease,
      transform 0.4s ease;
  }
  .barcode-bar {
    opacity: 0.3;
    transform: scaleY(1);
    transition:
      transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      opacity 0.4s ease;
    transform-origin: bottom;
  }
  .bg-zinc-900 .scanner-viewfinder {
    color: #4ade80;
    opacity: 1;
    animation: viewfinder-pulse 2s ease-in-out infinite;
  }
  .bg-zinc-900 .barcode-bar {
    opacity: 1;
    animation: bar-dance 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  .bg-zinc-900 .scan-line-hero {
    opacity: 1;
    animation: laser-sweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
  }
  .bg-zinc-900 .btn-scan-sweep {
    opacity: 1;
    animation: sweep-move 2s linear infinite;
  }
  @keyframes bar-dance {
    0%,
    100% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(2.2);
    }
  }
  @keyframes laser-sweep {
    0% {
      top: 15%;
      transform: scaleX(0.85);
    }
    100% {
      top: 85%;
      transform: scaleX(1.1);
    }
  }
  @keyframes viewfinder-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  @keyframes sweep-move {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }
  .scan-flash::after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: #22c55e;
    border-radius: inherit;
    pointer-events: none;
    z-index: 30;
    animation: success-overlay 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }
  @keyframes success-overlay {
    0% {
      opacity: 0.5;
      box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
    }
    100% {
      opacity: 0;
      box-shadow: inset 0 0 0 rgba(255, 255, 255, 0);
    }
  }
</style>
