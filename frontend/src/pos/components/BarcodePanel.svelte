<script lang="ts">
  import { startBarcodeScanner } from "../../barcode";
  import { apiSearch, BASE_URL, formatCurrency } from "../../utils";
  import type { ActiveOrderItem, POSProduct } from "../main/types";
  import { onMount, onDestroy } from "svelte";

  let {
    isHeld,
    addItemToOrder,
    hasActiveOrder,
    showToast
  }: {
    hasActiveOrder: boolean;
    isHeld: boolean;
    addItemToOrder: (p: ActiveOrderItem) => void;
    showToast: (m: string) => void;
  } = $props();

  let searchQuery = $state<string>("");
  let searchResults: POSProduct[] = $state([]);
  let scanning = $state<boolean>(false);
  let scanFlash = $state<boolean>(false);
  
  // ── Loading states ──────────────────────────────────────────────────────────
  let isSearching = $state<boolean>(false);
  let isBarcodeSearching = $state<boolean>(false);

  let hasSearchQuery = $derived(searchQuery.trim().length > 0);

  let stopScanner: (() => void) | null = null;

  function onBarcodeScanned(barcode: string): void {
    console.log(barcode);
    
    if (isHeld || !hasActiveOrder || isBarcodeSearching) return;
    triggerScanEffect();
    handleSearchBarcode(barcode);
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

  async function handleSearch(input: string) {
    if (isSearching) return;
    isSearching = true;
    
    try {
      searchResults = await apiSearch({
        searchKey: input,
        url: `${BASE_URL}/products/search?barcode=${input}`,
        searchAfterChars: 8,
      });
    } catch (err) {
      showToast("Search failed. Please try again.");
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  async function handleSearchBarcode(input: string) {
    if (isBarcodeSearching) return;
    isBarcodeSearching = true;
    
    try {
      const search = await fetch(`${BASE_URL}/products/search/barcode?query=${input}`);
      const res = await search.json();

      if (!search.ok) {
        showToast("Could not find this product");
        return;
      }

      showToast(res.message);
      addItemToOrder({ ...res.product, qty: 1 });
    } catch (err) {
      showToast("Barcode search failed. Please try again.");
    } finally {
      isBarcodeSearching = false;
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  onMount(() => {
    stopScanner = startBarcodeScanner(onBarcodeScanned);
  });

  onDestroy(() => {
    stopScanner?.();
  });
</script>

<div class="flex flex-col flex-1 overflow-hidden relative">
  <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
    {#if !hasSearchQuery}
      <div class="flex-1 flex flex-col items-center justify-center p-5 gap-6">
        <button
          disabled={isHeld || !hasActiveOrder || isBarcodeSearching}
          aria-label={scanning ? "Scanning…" : isBarcodeSearching ? "Searching product…" : "Scan barcode"}
          class="relative shrink-0 rounded-2xl max-w-min min-w-max flex items-center p-5 gap-5 overflow-hidden transition-all duration-500 active:scale-[0.98]
    {isHeld || !hasActiveOrder || isBarcodeSearching ? 'bg-zinc-200 cursor-not-allowed opacity-60' : scanning ? 'bg-zinc-900 cursor-default' : 'bg-[#0A0A0A] hover:bg-zinc-900 cursor-pointer'} 
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
          <div class="flex items-center gap-1.25 { (!hasActiveOrder || isHeld || isBarcodeSearching ) ? 'opacity-40 cursor-not-allowed' : ''}">
            <span class="w-1.25 h-1.25 rounded-full {scanning || isBarcodeSearching ? 'bg-green-400 animate-ping' : 'bg-green-400 animate-pulse'}"></span>
            <span class="text-xs font-medium capitalize tracking-widest {scanning || isBarcodeSearching ? 'text-green-300' : 'text-zinc-500'}">
              {isBarcodeSearching ? "Searching product…" : scanning ? "Reading…" : "Scanner ready"}
            </span>
          </div>
        </div>

        <div class="text-center max-w-65 mt-2 { (!hasActiveOrder || isHeld || isBarcodeSearching ) ? 'opacity-40 cursor-not-allowed' : ''}">
          <h3 class="text-sm font-bold text-zinc-800 mb-2">Scan or Search</h3>
          <p class="text-xs text-zinc-500 leading-relaxed">
            Align the barcode within the scanner frame to automatically add an item.
            <br /><br />
            To search manually, type the barcode number in the input below to see matching results.
          </p>
        </div>
      </div>
    {/if}
    
    {#if hasSearchQuery}
      <div class="flex items-center justify-between px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-zinc-100">
        <span class="text-xs font-semibold text-zinc-600">Barcode search results</span>
        <span class="text-[11px] font-medium text-zinc-400">
          {#if isSearching}
            <span class="inline-flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-zinc-400 animate-bounce"></span>
              <span class="w-1 h-1 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 0.1s"></span>
              <span class="w-1 h-1 rounded-full bg-zinc-400 animate-bounce" style="animation-delay: 0.2s"></span>
            </span>
          {:else}
            {searchResults.length} item{searchResults.length !== 1 ? "s" : ""}
          {/if}
        </span>
      </div>
    {/if}

    {#if isSearching}
      <!-- Search skeleton loaders with shimmer -->
      <div class="flex flex-col gap-2 p-3">
        {#each Array(4) as _, i (i)}
          <div class="skeleton-row flex items-center gap-3 px-3 py-2.5 rounded-[11px] border border-zinc-100 bg-zinc-50/50 overflow-hidden relative">
            <div class="shimmer-bg absolute inset-0"></div>
            <div class="w-9 h-9 rounded-lg bg-zinc-200 ml-2 shrink-0 relative z-10"></div>
            <div class="flex-1 min-w-0 space-y-1.5 relative z-10">
              <div class="h-3.5 bg-zinc-200 rounded w-3/4"></div>
              <div class="h-2.5 bg-zinc-200 rounded w-1/3"></div>
            </div>
            <div class="w-14 h-3.5 bg-zinc-200 rounded shrink-0 relative z-10"></div>
            <div class="w-6 h-6 rounded-full bg-zinc-200 shrink-0 relative z-10"></div>
          </div>
        {/each}
      </div>
    {:else if searchResults.length === 0 && hasSearchQuery}
      <div class="flex flex-col items-center justify-center py-12 text-center gap-2 animate-fade-in">
        <svg class="w-8 h-8 text-zinc-300 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="text-sm font-semibold text-zinc-400">No matching barcode found</p>
      </div>
    {:else}
      {#each searchResults as result (result.id)}
        {@const meta = { emoji: "📦", color: "text-zinc-600", bg: "", border: "", hex: "#71717a" }}
        <button
          onclick={() => addItemToOrder({ ...result, qty: 1 })}
          class="flex items-center gap-3 px-3 py-2.5 rounded-[11px] border border-transparent hover:bg-zinc-50 hover:border-zinc-200 transition-all text-left cursor-pointer w-full group active:scale-[0.99] overflow-hidden relative animate-fade-in-up"
          style="animation-delay: {(Math.random() ) * 0.03}s; animation-fill-mode: both;"
          aria-label="Add {result.productName} — {formatCurrency(result.price)}"
        >
          <div class="absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-full opacity-60" style="background:{meta.hex}"></div>
          <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100 ml-2">
            <img src={result.productImage} alt="" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#0A0A0A] truncate leading-snug">{result.productName}</p>
            <p class="text-xs text-zinc-400 mt-0.5"><span class="font-['DM_Mono',monospace]">SKU: {result.barcode}</span></p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-['DM_Mono',monospace] text-sm font-medium text-zinc-600">{formatCurrency(result.price)}</span>
            <div class="w-6 h-6 bg-zinc-200 group-hover:bg-[#0A0A0A] rounded-full flex items-center justify-center shrink-0 transition-colors" aria-hidden="true">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-zinc-500 group-hover:text-white transition-colors"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
          </div>
        </button>
      {/each}
    {/if}
  </div>

  <div class="shrink-0 p-3 border-t border-zinc-100 bg-white">
    <div class="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-3 focus-within:border-zinc-400 transition-colors { (!hasActiveOrder || isHeld || isSearching ) ? 'opacity-40 cursor-not-allowed' : ''}">
      {#if isSearching}
        <div class="loader-dots shrink-0">
          <div></div>
          <div></div>
          <div></div>
        </div>
      {:else}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16M3 12H3.01M7.5 12H7.51M16.5 12H16.51M12 12H12.01M21 12H21.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {/if}
      <input
        readonly={!hasActiveOrder || isHeld || isSearching}
        oninput={(e) => handleSearch(e.currentTarget.value)}
        bind:value={searchQuery}
        type="text"
        placeholder={isSearching ? "Searching products…" : "Type barcode manually"}
        aria-label="Barcode search input"
        class="bg-transparent text-sm text-zinc-700 placeholder-zinc-400 font-normal outline-none w-full tracking-wider"
      />
      {#if searchQuery && !isSearching}
        <button onclick={() => { searchQuery = ""; searchResults = []; }} aria-label="Clear search" class="text-zinc-400 hover:text-zinc-600 shrink-0 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  /* ── Skeleton shimmer ─────────────────────────────────────────────────────── */
  .skeleton-row {
    position: relative;
    overflow: hidden;
  }
  .shimmer-bg {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 100%
    );
    animation: shimmer-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    transform: translateX(-100%);
  }
  @keyframes shimmer-slide {
    100% { transform: translateX(100%); }
  }

  /* ── Result list animations ───────────────────────────────────────────────── */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.35s ease-out forwards;
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }

  /* ── Input dots loader ────────────────────────────────────────────────────── */
  .loader-dots {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    width: 24px;
    height: 24px;
    justify-content: center;
  }
  .loader-dots div {
    width: 4px;
    height: 4px;
    background-color: #a1a1aa;
    border-radius: 50%;
    animation: loader-dots 1.4s ease-in-out infinite both;
  }
  .loader-dots div:nth-child(1) { animation-delay: -0.32s; }
  .loader-dots div:nth-child(2) { animation-delay: -0.16s; }
  @keyframes loader-dots {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Scan animations ──────────────────────────────────────────────────────── */
  .scan-line-hero {
    animation: sweepHero 0.9s ease-in-out infinite alternate;
  }
  @keyframes sweepHero {
    0% { top: 15%; }
    100% { top: 85%; }
  }
  .btn-scan-sweep::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.08) 50%, transparent 100%);
    animation: shimmer 1s ease-in-out infinite;
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .scan-flash {
    animation: flash 0.3s ease-out;
  }
  @keyframes flash {
    0% { background-color: #16a34a; }
    100% { background-color: #0a0a0a; }
  }
  .scan-line-hero {
    opacity: 0;
    top: 50%;
    transition: opacity 0.3s ease, top 0.3s ease;
  }
  .btn-scan-sweep {
    opacity: 0;
    background: linear-gradient(to bottom, transparent, rgba(74, 222, 128, 0.1), transparent);
    transition: opacity 0.5s ease;
  }
  .scanner-viewfinder {
    color: white;
    opacity: 0.8;
    transition: color 0.4s ease, opacity 0.4s ease, transform 0.4s ease;
  }
  .barcode-bar {
    opacity: 0.3;
    transform: scaleY(1);
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
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
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(2.2); }
  }
  @keyframes laser-sweep {
    0% { top: 15%; transform: scaleX(0.85); }
    100% { top: 85%; transform: scaleX(1.1); }
  }
  @keyframes viewfinder-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes sweep-move {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
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
    0% { opacity: 0.5; box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2); }
    100% { opacity: 0; box-shadow: inset 0 0 0 rgba(255, 255, 255, 0); }
  }
</style>