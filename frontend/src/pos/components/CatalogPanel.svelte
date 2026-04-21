<script lang="ts">
  import type { Category } from "../../shared/types";
  import { apiSearch, BASE_URL, formatCurrency } from "../../utils";
  import type { ActiveOrderItem, POSProduct } from "../main/types";

  let {categories, addItemToOrder}: { 
    categories: Category[], 
    addItemToOrder : (p: ActiveOrderItem) => void 
} = $props();
  
  let searchQuery = $state("");
  let hasSearchQuery = $derived(searchQuery.trim().length > 0);
  let selectedCategory: Category | null = $state(null);
  let searchResults: POSProduct[] = $state([]);


  async function handleSearch(input: string) {
    searchResults = await apiSearch({
      searchKey: input,
      url: `${BASE_URL}/products/search?query=${input}`,
    });
  }

  async function selectCategory(input: Category) {
    selectedCategory = input;
    searchResults = await apiSearch({
      searchKey: input.id,
      url: `${BASE_URL}/products/search?category=${input.id}`,
    });
  }
</script>

<div class="shrink-0 px-3 pt-3">
  <div class="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-3 focus-within:border-zinc-400 transition-colors">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    <input oninput={(e) => handleSearch(e.currentTarget.value)} bind:value={searchQuery} type="text" placeholder={selectedCategory?.categoryName ? `Search in ${selectedCategory.categoryName}…` : "Search all products…"} aria-label="Catalog search input" class="bg-transparent text-[14px] text-zinc-700 placeholder-zinc-400 font-medium outline-none w-full" />
    {#if searchQuery || selectedCategory}
      <button
        onclick={() => {
          searchQuery = "";
          selectedCategory = null;
          searchResults = [];
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
  {@const meta = { emoji: "📦", color: "text-zinc-700", bg: "", border: "", hex: "" }}
  <div class="shrink-0 px-3 pt-2.5">
    <button
      onclick={() => {
        selectedCategory = null;
        searchQuery = "";
        searchResults = [];
      }}
      class="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors group"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      <span>Categories</span>
      <span class="text-zinc-300 mx-0.5">/</span>
      <span class={meta.color}>{meta.emoji} {selectedCategory.categoryName}</span>
    </button>
  </div>
{/if}

<div class="shrink-0 h-px bg-zinc-100 mt-2.5"></div>

<div class="flex-1 overflow-y-auto custom-scrollbar min-h-0">
  {#if !hasSearchQuery && selectedCategory === null && searchResults.length === 0}
    <div class="p-3 grid grid-cols-2 gap-2">
      {#each categories as cat}
        {#if (cat?.productCount || 0) > 0}
          {@const meta = { emoji: "📦", color: "text-zinc-700", bg: "bg-zinc-50", border: "border-zinc-200", hex: "#71717a" }}
          {@const count = cat.productCount}
          <!-- {@const previews = catalog.filter((p) => p.category === cat).slice(0, 3)} -->
          <button onclick={() => selectCategory(cat)} class="group relative flex flex-col p-3 rounded-[14px] border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all text-left overflow-hidden active:scale-[0.98]" aria-label="Browse {cat.categoryName} category — {count} items">
            <div class="flex items-start justify-between mb-2.5">
              <div class="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] {meta.bg} border {meta.border} shrink-0">{meta.emoji}</div>
              <span class="text-[11px] font-bold {meta.color} {meta.bg} border {meta.border} rounded-full px-2 py-0.5 shrink-0">{count}</span>
            </div>
            <p class="text-[13px] font-bold text-zinc-800 mb-2">{cat.categoryName}</p>
           
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="absolute bottom-3 right-3 text-zinc-300 group-hover:text-zinc-500 transition-colors" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        {/if}
      {/each}
    </div>
  {/if}
  {#if (searchResults.length === 0 && hasSearchQuery) || (searchResults.length === 0 && selectedCategory)}
    <div class="flex flex-col items-center justify-center h-full py-12 text-center gap-2">
      <p class="text-[14px] font-semibold text-zinc-400">No products found</p>
      <button
        onclick={() => {
          searchQuery = "";
          selectedCategory = null;
          searchResults = [];
        }}
        class="text-[13px] text-zinc-400 underline-offset-2 underline hover:text-zinc-600 transition-colors">Clear filters</button
      >
    </div>
  {/if}
  {#if searchResults.length > 0}
    <div class="flex items-center justify-between px-4 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-zinc-100">
      {#if selectedCategory}
        {@const meta = { emoji: "📦", color: "text-zinc-600", bg: "", border: "", hex: "" }}
        <span class="text-[12px] font-bold {meta.color} flex items-center gap-1.5"><span>{meta.emoji}</span>{selectedCategory.categoryName}</span>
      {:else}
        <span class="text-[12px] font-semibold text-zinc-400">Search results</span>
      {/if}
      <span class="text-[11px] font-medium text-zinc-400">{searchResults.length} item{searchResults.length !== 1 ? "s" : ""}</span>
    </div>
    <div class="flex flex-col px-3 py-3 gap-1">
      {#each searchResults as p (p.id)}
        {@const meta = { emoji: "📦", color: "text-zinc-600", bg: "", border: "", hex: "#71717a" }}
        <button
            onclick={() => addItemToOrder({ ...p, qty: 1 })}
            class="flex items-center gap-3 px-3 py-2.5 rounded-[11px] border border-transparent hover:bg-zinc-50 hover:border-zinc-200 transition-all text-left cursor-pointer w-full group active:scale-[0.99] overflow-hidden relative"
            aria-label="Add {p.productName} — {formatCurrency(p.price)}"
        >
          <div class="absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-full opacity-60" style="background:{meta.hex}"></div>
          <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-zinc-100 ml-2">
            <img src={p.productImage} alt="" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13.5px] font-semibold text-[#0A0A0A] truncate leading-snug">{p.productName}</p>
            <p class="text-[11px] text-zinc-400 mt-0.5"><span class="font-['DM_Mono',monospace]">#{p.barcode}</span></p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="font-['DM_Mono',monospace] text-[13px] font-medium text-zinc-600">{formatCurrency(p.price)}</span>
            <div class="w-6 h-6 bg-zinc-200 group-hover:bg-[#0A0A0A] rounded-full flex items-center justify-center shrink-0 transition-colors" aria-hidden="true">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-zinc-500 group-hover:text-white transition-colors"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
