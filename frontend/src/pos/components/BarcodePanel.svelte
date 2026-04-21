<script lang="ts">
  import { apiSearch, BASE_URL, formatCurrency } from "../../utils";
  import type { ActiveOrderItem, POSProduct } from "../main/types";

  let {
    isHeld,
    addItemToOrder
  }: {
    isHeld: boolean;
    addItemToOrder : (p: ActiveOrderItem) => void
  } = $props();

  let searchQuery = $state<string>("");
  let searchResults: POSProduct[] = $state([]);
  let scanning = $state<boolean>(false);
  let scanFlash = $state<boolean>(false);

  let hasSearchQuery = $derived(searchQuery.trim().length > 0);

  function triggerScan(): void {
    if (scanning || isHeld) return;
    scanning = true;
    setTimeout(() => {
      scanFlash = true;
      setTimeout(() => {
        scanFlash = false;
      }, 5000);
      scanning = false;
    }, 1400);
    //   showToast(`Scanned: ${product.name}`);
  }

  function handleSearchKeydown(e: KeyboardEvent): void {
    // if (e.key === "Enter" && searchMode === "barcode" && searchQuery.trim() !== "") {
    //   const found = catalog.find((p) => p.barcode === searchQuery.trim());
    //   if (found) {
    //     addItem(found.id);
    //     searchQuery = "";
    //     scanFlash = true;
    //     showToast(`Added: ${found.name}`);
    //     setTimeout(() => {
    //       scanFlash = false;
    //     }, 2000);
    //   } else showToast("Barcode not found");
    // }
  }

  async function handleSearch(input: string) {
    searchResults = await apiSearch({
      searchKey: input,
      url: `${BASE_URL}/products/search/barcode?query=${input}`,
      searchAfterChars: 8,
    });
  }
</script>

<div class="flex flex-col flex-1 overflow-hidden relative">
  <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
    {#if !hasSearchQuery}
      <div class="flex-1 flex flex-col items-center justify-center p-5 gap-6">
        <button
          onclick={triggerScan}
          disabled={isHeld}
          aria-label={scanning ? "Scanning…" : "Scan barcode"}
          class="relative shrink-0 rounded-2xl max-w-min min-w-max flex items-center p-5 gap-5 overflow-hidden transition-all duration-500 active:scale-[0.98]
    {isHeld ? 'bg-zinc-200 cursor-not-allowed opacity-60' : scanning ? 'bg-zinc-900 cursor-default' : 'bg-[#0A0A0A] hover:bg-zinc-900 cursor-pointer'} 
    {scanFlash ? 'scan-flash' : ''}"
        >
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
        </button>

        <div class="flex flex-col items-center gap-1 z-10 relative">
          <div class="flex items-center gap-1.25">
            <span class="w-1.25 h-1.25 rounded-full {scanning ? 'bg-green-400 animate-ping' : 'bg-green-400 animate-pulse'}"></span>
            <span class="text-xs font-medium capitalize tracking-widest {scanning ? 'text-green-300' : 'text-zinc-500'}">{scanning ? "Reading…" : "Scanner ready"}</span>
          </div>
        </div>

        <div class="text-center max-w-65 mt-2">
          <h3 class="text-[14px] font-bold text-zinc-800 mb-2">Scan or Search</h3>
          <p class="text-[13px] text-zinc-500 leading-relaxed">
            Align the barcode within the scanner frame to automatically add an item.
            <br /><br />
            To search manually, type the barcode number in the input below to see matching results.
          </p>
        </div>
      </div>
    {/if}
    {#if hasSearchQuery}
      <div class="flex items-center justify-between px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-zinc-100">
        <span class="text-[12px] font-semibold text-zinc-600">Barcode search results</span>
        <span class="text-[11px] font-medium text-zinc-400">{searchResults.length} item{searchResults.length !== 1 ? "s" : ""}</span>
      </div>
    {/if}

    {#if searchResults.length === 0 && hasSearchQuery}
      <div class="flex flex-col items-center justify-center py-12 text-center gap-2">
        <p class="text-[14px] font-semibold text-zinc-400">No matching barcode found</p>
      </div>
    {:else}
      {#each searchResults as result (result.id)}
        {@const meta = { emoji: "📦", color: "text-zinc-600", bg: "", border: "", hex: "#71717a" }}
        <button
          onclick={() => addItemToOrder({ ...result, qty: 1 })}
          class="flex items-center gap-3 px-3 py-2.5 rounded-[11px] border border-transparent hover:bg-zinc-50 hover:border-zinc-200 transition-all text-left cursor-pointer w-full group active:scale-[0.99] overflow-hidden relative"
          aria-label="Add {result.productName} — {formatCurrency(result.price)}"
        >
          <div class="absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-full opacity-60" style="background:{meta.hex}"></div>
          <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100 ml-2">
            <img src={result.productImage} alt="" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13.5px] font-semibold text-[#0A0A0A] truncate leading-snug">{result.productName}</p>
            <p class="text-[11px] text-zinc-400 mt-0.5"><span class="font-['DM_Mono',monospace]">#{result.barcode}</span></p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-['DM_Mono',monospace] text-[13px] font-medium text-zinc-600">{formatCurrency(result.price)}</span>
            <div class="w-6 h-6 bg-zinc-200 group-hover:bg-[#0A0A0A] rounded-full flex items-center justify-center shrink-0 transition-colors" aria-hidden="true">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-zinc-500 group-hover:text-white transition-colors"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
          </div>
        </button>
      {/each}
    {/if}
  </div>

  <div class="shrink-0 p-3 border-t border-zinc-100 bg-white">
    <div class="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-3 focus-within:border-zinc-400 transition-colors">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16M3 12H3.01M7.5 12H7.51M16.5 12H16.51M12 12H12.01M21 12H21.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <input oninput={(e) => handleSearch(e.currentTarget.value)} bind:value={searchQuery} onkeydown={handleSearchKeydown} type="text" placeholder="Type barcode manually" aria-label="Barcode search input" class="bg-transparent text-[14px] text-zinc-700 placeholder-zinc-400 font-normal outline-none w-full tracking-wider" />
      {#if searchQuery}
        <button onclick={() => {searchQuery = "", searchResults = []}} aria-label="Clear search" class="text-zinc-400 hover:text-zinc-600 shrink-0 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
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
