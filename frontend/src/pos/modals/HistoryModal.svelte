<script lang="ts">
  import type { PastOrder, PastOrderStatus } from "../main/types";
  import { fmt, getProduct } from "../main/utils";

  

  interface Props {
    pastOrders: PastOrder[];
    onClose: () => void;
    onPrintReceipt: (id: string) => void;
  }
  let { pastOrders, onClose, onPrintReceipt }: Props = $props();

  let historySearch = $state<string>("");
  let historyFilter = $state<"all" | PastOrderStatus>("all");
  let expandedIds = $state<string[]>([]);

  const filteredOrders = $derived(
    pastOrders.filter((po) => {
      const matchesFilter = historyFilter === "all" || po.status === historyFilter;
      const matchesSearch = historySearch.trim() === "" || po.id.includes(historySearch.trim());
      return matchesFilter && matchesSearch;
    })
  );

  function toggleExpand(id: string): void {
    expandedIds = expandedIds.includes(id)
      ? expandedIds.filter((i) => i !== id)
      : [...expandedIds, id];
  }
</script>

<div
  class="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="history-modal-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[24px] w-full max-w-[640px] h-[82vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Dark header -->
    <div class="bg-[#0A0A0A] px-6 pt-6 pb-5 flex-shrink-0">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h3 id="history-modal-title" class="text-[22px] font-bold text-white leading-tight">Order History</h3>
          <p class="text-[13px] text-white/40 font-medium mt-0.5">Session transactions</p>
        </div>
        <button
          onclick={onClose}
          aria-label="Close history"
          class="cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                 text-white/60 hover:bg-white/20 hover:text-white transition-all flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Search + filter -->
      <div class="flex gap-2">
        <div class="flex-1 flex items-center gap-2 bg-white/10 rounded-[10px] px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            bind:value={historySearch}
            type="text"
            placeholder="Search by order ID…"
            aria-label="Search order history"
            class="bg-transparent text-[13px] text-white placeholder-white/30 font-medium outline-none w-full"
          />
        </div>

        <div class="flex gap-1 bg-white/10 p-1 rounded-[10px]" role="group" aria-label="Filter orders">
          {#each (["all", "paid", "cancelled"] as const) as f}
            <button
              onclick={() => (historyFilter = f)}
              aria-pressed={historyFilter === f}
              class="px-3 py-1.5 rounded-[7px] text-[12px] font-semibold capitalize transition-all
                     {historyFilter === f ? 'bg-white text-[#0A0A0A]' : 'text-white/50 hover:text-white/80'}"
            >
              {f}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar bg-white p-2">
      {#if filteredOrders.length === 0}
        <div class="flex flex-col items-center justify-center h-full text-center gap-3">
          <div class="w-14 h-14 rounded-[14px] bg-zinc-50 flex items-center justify-center border border-zinc-100">
            <svg class="size-6 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p class="text-[15px] font-medium text-zinc-500">No orders found</p>
            <p class="text-[13px] text-zinc-400 mt-1">
              {historySearch ? "Try a different search term" : "No past orders yet"}
            </p>
          </div>
        </div>
      {:else}
        <div class="flex flex-col">
          {#each filteredOrders as po}
            {@const isExpanded = expandedIds.includes(po.id)}
            <div class="bg-white border-b border-zinc-100 last:border-0 transition-all">
              <button
                class="w-full grid grid-cols-[100px_1fr_1.5fr_80px_24px] gap-4 p-4 text-left hover:bg-zinc-50/50 transition-colors items-center"
                onclick={() => toggleExpand(po.id)}
                aria-expanded={isExpanded}
                aria-label="Order #{po.id} — {po.date} — {po.status} — {fmt(po.total)}"
              >
                <span class="font-['DM_Mono',monospace] text-[14px] font-medium text-zinc-900">#{po.id}</span>
                <span class="text-[13px] text-zinc-400 truncate">{po.date}</span>
                <span class="text-[12px] font-medium text-zinc-500 flex items-center gap-1">
                  {po.status === "paid" ? "Paid" : "Cancelled"}
                  {#if po.method !== "-"}
                    <span class="text-xs font-normal font-mono capitalize text-zinc-400">({po.method})</span>
                  {/if}
                </span>
                <span class="font-['DM_Mono',monospace] text-[15px] font-medium text-right
                             {po.status === 'cancelled' ? 'text-zinc-300 line-through' : 'text-[#0A0A0A]'}">
                  {fmt(po.total)}
                </span>
                <div class="flex justify-end" aria-hidden="true">
                  <svg
                    class="w-4 h-4 text-zinc-300 transition-transform {isExpanded ? 'rotate-180' : ''}"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {#if isExpanded}
                <div class="px-4 pb-4 pt-1">
                  {#if po.items.length === 0}
                    <p class="text-[13px] text-zinc-400 italic">No items recorded.</p>
                  {:else}
                    <div class="flex flex-col gap-2 mb-4 bg-zinc-50/50 p-3 rounded-[8px]">
                      {#each po.items as item}
                        {@const product = getProduct(item.productId)}
                        {#if product}
                          <div class="flex justify-between items-center">
                            <span class="text-[13px] text-zinc-600">
                              {product.name}
                              <span class="text-zinc-400 ml-1">×{item.qty}</span>
                            </span>
                            <span class="font-['DM_Mono',monospace] text-[13px] text-zinc-800">
                              {fmt(product.price * item.qty)}
                            </span>
                          </div>
                        {/if}
                      {/each}
                    </div>
                  {/if}

                  <div class="flex justify-end">
                    <button
                      onclick={(e) => { e.stopPropagation(); onPrintReceipt(po.id); }}
                      class="flex gap-1 cursor-pointer text-[12px] font-medium text-zinc-600
                             hover:text-[#0A0A0A] border-b border-zinc-300 hover:border-[#0A0A0A] transition-all pb-0.5"
                    >
                      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                      </svg>
                      <span>Print Receipt</span>
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
  .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
</style>