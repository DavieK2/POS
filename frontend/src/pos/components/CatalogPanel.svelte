<script lang="ts">
  import type { Category } from "../../shared/types";
  import { apiSearch, BASE_URL, formatCurrency } from "../../utils";
  import type { ActiveOrderItem, Order, POSProduct } from "../main/types";

  let {
    categories,
    addItemToOrder,
    isHeld,
    activeOrder,
  }: {
    activeOrder: Order | null;
    categories: Category[];
    isHeld: boolean;
    addItemToOrder: (p: ActiveOrderItem) => void;
  } = $props();

  let searchQuery = $state("");
  let hasSearchQuery = $derived(searchQuery.trim().length > 0);
  let selectedCategory: Category | null = $state(null);
  let searchResults: POSProduct[] = $state([]);
  let isLoading = $state(false);

  function stringToGradient(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 70%, 50%))`;
  }

  function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 50%)`;
  }

  async function handleSearch(input: string) {
    if (isHeld) return;
    isLoading = true;
    try {
      searchResults = await apiSearch({
        searchKey: input,
        url: `${BASE_URL}/products/search?query=${input}`,
      });
    } finally {
      isLoading = false;
    }
  }

  async function selectCategory(input: Category) {
    if (isHeld) return;
    isLoading = true;
    try {
      selectedCategory = input;
      searchResults = await apiSearch({
        searchKey: input.id,
        url: `${BASE_URL}/products/search?category=${input.id}`,
      });
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="shrink-0 px-3 pt-3">
  <div class="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-3 focus-within:border-zinc-400 transition-colors {isHeld || !activeOrder ? 'opacity-50 grayscale-[0.5] pointer-events-none' : ''}">
    {#if isLoading}
      <svg class="animate-spin shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="2.5" aria-hidden="true">
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
      </svg>
    {:else}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    {/if}
    <input oninput={(e) => handleSearch(e.currentTarget.value)} bind:value={searchQuery} type="text" disabled={isHeld || !activeOrder} placeholder={selectedCategory?.categoryName ? `Search in ${selectedCategory.categoryName}…` : "Search all products…"} aria-label="Catalog search input" class="bg-transparent text-sm text-zinc-700 placeholder-zinc-400 font-medium outline-none w-full disabled:cursor-not-allowed" />
    {#if (searchQuery || selectedCategory) && !isHeld}
      <button
        onclick={() => {
          searchQuery = "";
          selectedCategory = null;
          searchResults = [];
          isLoading = false;
        }}
        aria-label="Clear search and filters"
        class="text-zinc-400 hover:text-zinc-600 shrink-0 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    {/if}
  </div>
</div>

{#if selectedCategory}
  <div class="shrink-0 px-3 pt-2.5">
    <button
      onclick={() => {
        selectedCategory = null;
        searchQuery = "";
        searchResults = [];
        isLoading = false;
      }}
      disabled={isHeld || !activeOrder}
      class="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors group disabled:opacity-50"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      <span>Categories</span>
      <span class="text-zinc-300 mx-0.5">/</span>
      <span class="text-zinc-700">{selectedCategory.categoryName}</span>
    </button>
  </div>
{/if}

<div class="shrink-0 h-px bg-zinc-100 mt-2.5"></div>

<div class="flex-1 overflow-y-auto custom-scrollbar min-h-0 {isHeld || !activeOrder ? 'opacity-40 grayscale-[0.8] pointer-events-none select-none' : ''}">
  {#if isLoading}
    <div class="flex flex-col px-3 py-3 gap-1">
      {#each Array(8) as _, i (i)}
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-[11px] border-0 border-b border-zinc-100 animate-pulse">
          <div class="absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-full bg-zinc-200"></div>
          <div class="w-9 h-9 rounded-lg bg-zinc-200 ml-2 shrink-0"></div>
          <div class="flex-1 min-w-0 space-y-1.5">
            <div class="h-3.5 bg-zinc-200 rounded w-3/4"></div>
            <div class="h-2.5 bg-zinc-200 rounded w-1/3"></div>
          </div>
          <div class="h-3.5 bg-zinc-200 rounded w-10 shrink-0"></div>
        </div>
      {/each}
    </div>
  {:else if searchResults.length > 0}
    <div class="flex items-center justify-between px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-zinc-100">
      {#if selectedCategory}
        <span class="text-sm font-bold text-zinc-600 flex items-center gap-1.5">{selectedCategory.categoryName}</span>
      {:else}
        <span class="text-sm font-semibold text-zinc-400">Search results</span>
      {/if}
      <span class="text-xs font-medium text-zinc-400">{searchResults.length} item{searchResults.length !== 1 ? "s" : ""}</span>
    </div>
    <div class="flex flex-col px-3 py-3 gap-1">
      {#each searchResults as p (p.id)}
        <button onclick={() => addItemToOrder({ ...p, qty: 1 })} disabled={isHeld || !activeOrder} class="flex items-center gap-3 px-3 py-2.5 rounded-[11px] border-0 border-b border-zinc-100 hover:bg-zinc-50 transition-all text-left cursor-pointer w-full group active:scale-[0.99] overflow-hidden relative disabled:cursor-not-allowed disabled:active:scale-100" aria-label="Add {p.productName} — {formatCurrency(p.price)}">
          <div class="absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-full opacity-60" style="background: {stringToColor(p.id)}"></div>
          <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100 ml-2 flex items-center justify-center">
            {#if p.productImage}
              <img src={p.productImage} alt="" class="w-full h-full object-cover" />
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#0A0A0A] truncate leading-snug">{p.productName}</p>
            <p class="text-xs text-zinc-400 mt-0.5"><span class="font-['DM_Mono',monospace]">SKU:{p.barcode}</span></p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-['DM_Mono',monospace] text-xs font-medium text-zinc-600">{formatCurrency(p.price)}</span>
            <div class="w-6 h-6 bg-zinc-200 group-hover:bg-[#0A0A0A] rounded-full flex items-center justify-center shrink-0 transition-colors" aria-hidden="true">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-zinc-500 group-hover:text-white transition-colors"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {:else if !hasSearchQuery && selectedCategory === null}
    <div class="p-3 grid grid-cols-2 gap-2">
      {#each categories as cat}
        {#if (cat?.productCount || 0) > 0}
          {@const count = cat.productCount}
          <button onclick={() => selectCategory(cat)} disabled={isHeld || !activeOrder} class="group relative flex flex-col p-3 rounded-[14px] border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all text-left overflow-hidden active:scale-[0.98] disabled:active:scale-100" aria-label="Browse {cat.categoryName} category — {count} items">
            <div class="flex items-start justify-between mb-2.5">
              <div class="w-10 h-10 rounded-[10px] flex items-center bg-zinc-500 justify-center text-lg text-white font-bold shrink-0">
                {cat.categoryName.charAt(0).toUpperCase()}
              </div>
              <span class="text-[10px] font-bold text-white rounded-full h-5 w-5 bg-zinc-300 flex items-center justify-center shrink-0">{count}</span>
            </div>
            <p class="text-sm font-bold text-zinc-800 mb-2">{cat.categoryName}</p>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="absolute bottom-3 right-3 text-zinc-300 group-hover:text-zinc-500 transition-colors" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center h-full py-12 text-center gap-2">
      <p class="text-sm font-semibold text-zinc-400">No products found</p>
      <button
        onclick={() => {
          searchQuery = "";
          selectedCategory = null;
          searchResults = [];
          isLoading = false;
        }}
        disabled={isHeld || !activeOrder}
        class="text-[13px] text-zinc-400 underline-offset-2 underline hover:text-zinc-600 transition-colors disabled:no-underline">Clear filters</button
      >
    </div>
  {/if}
</div>
