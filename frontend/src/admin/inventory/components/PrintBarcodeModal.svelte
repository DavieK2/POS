<script lang="ts">
  import { onMount } from "svelte";
  import Dropdown from "../../../shared/dropdown.svelte";
  import { BASE_URL } from "../../../utils";
  import { showToast } from "../../../lib/toast";
  import Button from "../../../shared/button.svelte";
  import type { DropDownOptions, Product } from "../../../shared/types";

  let {
    closePrintBarcodeModal,
    currentProduct,
  }: {
    closePrintBarcodeModal: () => void;
    currentProduct: Product;
  } = $props();

  interface PrinterData {
    deviceId: string;
    name: string;
    paperSizes: string[];
  }

  let printers: DropDownOptions[] = $state([]);
  let printersRaw: PrinterData[] = $state([]);
  let printQuantity = $state(1);
  let selectedPrinter = $state({ text: "Select a printer", value: "" });
  let selectedPaperSize = $state("");
  let labelWidth = $state(4);
  let labelHeight = $state(2);

  let paperSizeOptions: DropDownOptions[] = $derived(selectedPrinter.value ? printersRaw.find( p => p.deviceId === selectedPrinter.value )!.paperSizes.map((s) => ({ text: s, value: s })) : []);

  let isPrinting = $state(false);

  onMount(() => {
    getPrinters();
  });

  const getPrinters = async (): Promise<void> => {
    const req = await fetch(`${BASE_URL}/printers`);

    if (!req.ok) {
      const res = await req.json();
      console.log(res);
      showToast(res.message);
      return;
    }

    const res: PrinterData[] = await req.json();
    printersRaw = res;
    printers = res.flatMap((p) => ([{ text: p.name, value: p.deviceId }]));
    selectedPrinter = printers[0]

  };

  const handlePrintBarcode = async (): Promise<void> => {

    isPrinting = true;

    if (!currentProduct) {
      isPrinting = false;
      return
    };

    const req: Response = await fetch(`${BASE_URL}/print/barcode/${currentProduct.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        printer: selectedPrinter.value,
        paperSize: selectedPaperSize,
        width: labelWidth,
        height: labelHeight,
        quantity: printQuantity,
      }),
    });
    
    const res = await req.json();

    if( ! req.ok ){
       
      showToast(res.message);
      isPrinting = false
      return

    }

    showToast(res.message);

    isPrinting = false;

    return;
    // closePrintBarcodeModal();
  };
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
  onclick={closePrintBarcodeModal}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") closePrintBarcodeModal();
  }}
  aria-hidden="true"
>
  <div class="bg-white rounded-2xl max-h-[95vh] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in" role="dialog" aria-modal="true" aria-labelledby="print-barcode-modal-title" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
      <h2 id="print-barcode-modal-title" class="text-lg font-semibold text-black">Print Barcode Labels</h2>
      <button onclick={closePrintBarcodeModal} class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="w-full max-h-[75vh] overflow-y-auto">
      <form
        onsubmit={(e) => {
          e.preventDefault();
          handlePrintBarcode();
        }}
        class="p-6 space-y-6"
      >
        <!-- Label preview -->
        <div>
          <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-3">Label Preview</p>
          <div class="flex justify-center">
            <div class="relative bg-white border-2 border-neutral-300 rounded-md shadow-md px-4 pt-3 pb-2 w-64" style="font-family: monospace;">
              <div class="flex items-end justify-center gap-px mb-1 bg-white">
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <img src={currentProduct.barcodeImage} alt="barcode-print" />
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
              </div>

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
          <label for="print-quantity" class="block text-sm font-medium text-neutral-700 mb-2"> Number of Labels </label>
          <div class="flex items-center gap-3">
            <button type="button" onclick={() => (printQuantity = Math.max(1, printQuantity - 1))} class="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Decrease quantity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14" />
              </svg>
            </button>
            <input id="print-quantity" type="number" bind:value={printQuantity} min="1" max="100" class="w-16 px-3 py-2 text-center border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white font-medium" />
            <button type="button" onclick={() => (printQuantity = Math.min(100, printQuantity + 1))} class="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Increase quantity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-neutral-400 mt-1">Maximum 100 labels per print job</p>
        </div>

        <!-- Printer selector -->
        <div class="space-y-2">
          <label for="selectprinter" class="block text-sm font-semibold text-neutral-700">Select Printer</label>
          <Dropdown
            selected={selectedPrinter}
            options={printers}
            onSelect={(option) => {
              selectedPrinter = option;
            }}
          />
        </div>

        <!-- Printer-specific fields: only shown when a printer is selected -->
        {#if selectedPrinter.value.length > 0}
          <div class="space-y-4 animate-fade-in">
            <!-- Paper size dropdown -->
            <div class="space-y-2">
              <label for="papersize" class="block text-sm font-semibold text-neutral-700">Paper Size</label>
              <Dropdown selected={paperSizeOptions[0] || { text: "Select paper size", value: "" }} options={paperSizeOptions} onSelect={(option) => (selectedPaperSize = option.value)} />
            </div>

            <!-- Width & Height inputs -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="label-width" class="block text-sm font-semibold text-neutral-700">
                  Width <span class="text-neutral-400 font-normal">(in)</span>
                </label>
                <input id="label-width" type="number" bind:value={labelWidth} min="1" placeholder="e.g. 4" class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white text-sm" />
              </div>
              <div class="space-y-2">
                <label for="label-height" class="block text-sm font-semibold text-neutral-700">
                  Height <span class="text-neutral-400 font-normal">(in)</span>
                </label>
                <input id="label-height" type="number" bind:value={labelHeight} min="1" placeholder="e.g. 2" class="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white text-sm" />
              </div>
            </div>
          </div>
        {/if}

        <!-- Print settings summary -->
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <h4 class="font-medium text-neutral-800 mb-2">Print Settings</h4>
          <ul class="space-y-1.5 text-sm text-neutral-600">
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12" /></svg>
              Label size: {labelWidth || "—"}in × {labelHeight || "—"}in
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12" /></svg>
              Format: EAN-13 with human-readable text
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12" /></svg>
              Printer: {selectedPrinter?.text ?? "Default system printer"}
            </li>
            {#if selectedPaperSize}
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12" /></svg>
                Paper size: {selectedPaperSize}
              </li>
            {/if}
          </ul>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick={closePrintBarcodeModal} class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Cancel </button>
          <Button
            label="Print {printQuantity} Label{printQuantity > 1 ? 's' : ''}"
            loading={isPrinting}
            disabled={printQuantity < 1}
            onclick={handlePrintBarcode}
          />
        </div>
      </form>
    </div>
  </div>
</div>
