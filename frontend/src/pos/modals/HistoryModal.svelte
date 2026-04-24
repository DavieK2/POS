<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../utils";
  import type { Order, PastOrderStatus } from "../main/types";
  import { fmt, formatDate, orderSubtotal, orderTotal } from "../main/utils";
  import Datepicker from "../../shared/datepicker.svelte";

  interface Props {
    onClose: () => void;
    onPrintReceipt: (order: Order) => void;
  }
  let { onClose, onPrintReceipt }: Props = $props();

  let historySearch = $state<string>("");
  let historyFilter = $state<"all" | PastOrderStatus>("all");
  let expandedIds = $state<string[]>([]);
  let orderHistory = $state<Order[]>([]);

  // ── Infinite scroll ──
  const PAGE_SIZE = 20;
  let offset = $state(0);
  let hasMore = $state(true);
  let isLoading = $state(false);
  let isRefreshing = $state(false);
  let scrollContainer = $state<HTMLDivElement | null>(null);
  let sentinelEl = $state<HTMLDivElement | null>(null);
  let searchTimeout: ReturnType<typeof setTimeout>;

  // ── Date filter ──
  let showDatePicker = $state(false);
  let dateFrom = $state<Date | null>(null);
  let dateTo = $state<Date | null>(null);

  // ── Print receipt loading ──
  let printingOrderId = $state<string | null>(null);

  async function handlePrintReceipt(po: Order, e: Event) {
    e.stopPropagation();
    if (printingOrderId) return;
    printingOrderId = po.id;
    try {
      await Promise.resolve(onPrintReceipt(po));
    } finally {
      printingOrderId = null;
    }
  }

  const filteredOrders = $derived(
    orderHistory.filter((po) => {
      const matchesFilter = historyFilter === "all" || po.status === historyFilter;
      const term = historySearch.trim().toLowerCase();
      const matchesSearch = term === "" || po.id.toLowerCase().includes(term) || (po.orderId && po.orderId.toLowerCase().includes(term)) || (po.createdAt && formatDate(po.createdAt).toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    }),
  );

  function formatCalendarDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function buildQueryString(currentOffset: number): string {
    const queryValue = historyFilter === "all" ? "paid,cancelled" : historyFilter;
    const parts = [`query=${queryValue}`, `limit=${PAGE_SIZE}`, `offset=${currentOffset}`];

    if (historySearch.trim()) {
      parts.push(`search=${encodeURIComponent(historySearch.trim())}`);
    }
    if (dateFrom) {
      parts.push(`dateFrom=${encodeURIComponent(formatCalendarDate(dateFrom))}`);
    }
    if (dateTo) {
      parts.push(`dateTo=${encodeURIComponent(formatCalendarDate(dateTo))}`);
    }
    return parts.join("&");
  }

  async function fetchOrders(reset = false) {
    if (isLoading) return;
    if (!reset && !hasMore) return;

    isLoading = true;
    if (reset) isRefreshing = true;
    const currentOffset = reset ? 0 : offset;

    try {
      await api({
        url: `/orders?${buildQueryString(currentOffset)}`,
        method: "GET",
        onSuccess: (data: Order[]) => {
          if (reset) {
            orderHistory = data;
          } else {
            orderHistory = [...orderHistory, ...data];
          }
          hasMore = data.length === PAGE_SIZE;
          offset = currentOffset + data.length;
        },
        withAuth: true,
      });
    } finally {
      isLoading = false;
      isRefreshing = false;
    }
  }

  function resetAndFetch() {
    offset = 0;
    hasMore = true;
    fetchOrders(true);
  }

  onMount(() => {
    fetchOrders(true);
  });

  // Watch the sentinel and fetch the next page when it enters the scroll container
  $effect(() => {
    if (!sentinelEl || !scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchOrders(false);
        }
      },
      { root: scrollContainer, rootMargin: "200px" },
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
  });

  function toggleExpand(id: string): void {
    expandedIds = expandedIds.includes(id) ? expandedIds.filter((i) => i !== id) : [...expandedIds, id];
  }
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="bg-white rounded-3xl w-full max-w-160 h-[82vh] flex flex-col shadow-2xl overflow-hidden animate-modal-in" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <!-- Dark header -->
    <div class="bg-[#0A0A0A] px-6 pt-6 pb-5 shrink-0">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h3 id="history-modal-title" class="text-xl font-bold text-white leading-tight">Order History</h3>
          <p class="text-sm text-white/40 font-medium mt-0.5">Session transactions</p>
        </div>
        <button
          onclick={onClose}
          aria-label="Close history"
          class="cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                 text-white/60 hover:bg-white/20 hover:text-white transition-all shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Search + filter -->
      <div class="flex gap-2">
        <div class="flex-1 flex items-center gap-2 bg-white/10 rounded-[10px] px-3 py-2 relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            bind:value={historySearch}
            oninput={() => {
              clearTimeout(searchTimeout);
              searchTimeout = setTimeout(resetAndFetch, 350);
            }}
            type="text"
            placeholder="Search by order ID or date…"
            aria-label="Search order history"
            class="bg-transparent text-sm text-white placeholder-white/30 font-medium outline-none w-full"
          />
          {#if isRefreshing && historySearch.trim()}
            <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          {/if}
        </div>

        <div class="flex gap-1 bg-white/10 p-1 rounded-[10px] relative" role="group" aria-label="Filter orders">
          {#each ["all", "paid", "cancelled"] as const as f}
            <button
              onclick={() => {
                historyFilter = f;
                resetAndFetch();
              }}
              aria-pressed={historyFilter === f}
              class="px-3 py-1.5 rounded-[7px] text-xs font-semibold capitalize transition-all relative
                     {historyFilter === f ? 'bg-white text-[#0A0A0A]' : 'text-white/50 hover:text-white/80'}"
            >
              {f}
              {#if isRefreshing && historyFilter === f}
                <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {/if}
            </button>
          {/each}
        </div>

        <button
          onclick={() => (showDatePicker = !showDatePicker)}
          aria-pressed={showDatePicker}
          aria-label="Toggle date filter"
          class="px-3 py-1.5 rounded-[7px] text-xs font-semibold transition-all relative bg-white/10
                 {showDatePicker ? 'bg-white text-[#0A0A0A]' : 'text-white/50 hover:text-white/80'}"
        >
          <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      <!-- Date picker -->
      {#if showDatePicker}
        <Datepicker bind:dateFrom bind:dateTo onSelect={() => resetAndFetch()} onClear={() => resetAndFetch()} />
      {/if}
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar bg-white p-2 relative" bind:this={scrollContainer}>
      {#if isRefreshing && orderHistory.length === 0}
        <div class="flex flex-col items-center justify-center h-full gap-3">
          <div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
          <span class="text-sm text-zinc-400">Loading orders...</span>
        </div>
      {:else if filteredOrders.length === 0}
        <div class="flex flex-col items-center justify-center h-full text-center gap-3">
          <div class="w-14 h-14 rounded-[14px] bg-zinc-50 flex items-center justify-center border border-zinc-100">
            <svg class="size-6 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p class="text-base font-medium text-zinc-500">No orders found</p>
            <p class="text-sm text-zinc-400 mt-1">
              {historySearch ? "Try a different search term" : "No past orders yet"}
            </p>
          </div>
        </div>
      {:else}
        <div class="flex flex-col">
          {#each filteredOrders as po (po.id)}
            {@const isExpanded = expandedIds.includes(po.id)}
            <div class="bg-white border-b border-zinc-100 last:border-0">
              <button class="w-full grid grid-cols-[100px_2.5fr_1fr_80px_24px] gap-4 p-4 text-left hover:bg-zinc-50/50 transition-colors items-center" onclick={() => toggleExpand(po.id)} aria-expanded={isExpanded} aria-label="Order #{po.orderId} — {formatDate(po.createdAt!)} — {po.status} — {fmt(orderTotal(po))}">
                <span class="text-sm font-medium text-zinc-900">#{po.orderId}</span>
                <span class="text-xs text-zinc-700">{formatDate(po.createdAt!)}</span>
                <span class="text-xs font-medium {po.status === 'paid' ? 'text-green-800' : 'text-red-700'} flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full {po.status === 'paid' ? 'bg-green-500' : 'bg-red-500'}"></span>
                  {po.status === "paid" ? "Paid" : "Cancelled"}
                </span>
                <span
                  class="text-xs font-medium text-right
                             {po.status === 'cancelled' ? 'text-zinc-700 line-through' : 'text-[#0A0A0A]'}"
                >
                  {fmt(orderTotal(po))}
                </span>
                <div class="flex justify-end" aria-hidden="true">
                  <svg class="w-4 h-4 text-zinc-700 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {#if isExpanded}
                {@const subtotal = orderSubtotal(po)}
                {@const discount = po.discount ?? po.discount ?? 0}
                {@const total = orderTotal(po)}
                <div class="px-4 pb-4 pt-1">
                  {#if po.items.length === 0}
                    <p class="text-sm text-zinc-400 italic">No items recorded.</p>
                  {:else}
                    <div class="flex flex-col gap-2 mb-4 bg-zinc-50/50 p-3 rounded-lg">
                      {#each po.items as item}
                        <div class="flex justify-between items-center font-medium">
                          <span class="text-xs text-zinc-700">
                            {item.productName}
                            <span class="text-zinc-400 ml-1">×{item.qty}</span>
                          </span>
                          <span class="text-xs text-zinc-800">
                            {fmt(item.price * item.qty)}
                          </span>
                        </div>
                      {/each}
                    </div>
                  {/if}

                  <div class="flex flex-col gap-1.5 mb-4 px-3">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-zinc-500">Subtotal</span>
                      <span class="text-zinc-700 font-medium">{fmt(subtotal)}</span>
                    </div>
                    {#if discount > 0}
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-zinc-500">Discount</span>
                        <span class="text-green-700 font-medium">−{fmt(discount)}</span>
                      </div>
                    {/if}
                    <div class="flex justify-between items-center text-xs pt-1.5 border-t border-zinc-200 mt-0.5">
                      <span class="text-zinc-900 font-semibold">Total</span>
                      <span class="text-[#0A0A0A] font-bold">{fmt(total)}</span>
                    </div>
                  </div>

                  {#if po.status !== "cancelled"}
                    <div class="flex justify-end">
                      <button
                        onclick={(e) => handlePrintReceipt(po, e)}
                        disabled={printingOrderId === po.id}
                        class="flex gap-1.5 items-center text-xs font-medium text-zinc-600
                 hover:text-[#0A0A0A] border-b border-zinc-300 hover:border-[#0A0A0A] transition-all pb-0.5
                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {#if printingOrderId === po.id}
                          <div class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Printing...</span>
                        {:else}
                          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                          </svg>
                          <span>Print Receipt</span>
                        {/if}
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}

          {#if hasMore && !isLoading}
            <div bind:this={sentinelEl} class="h-8 w-full" aria-hidden="true"></div>
          {/if}

          {#if isLoading && !isRefreshing}
            <div class="flex items-center justify-center py-6 gap-2">
              <div class="w-4 h-4 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
              <span class="text-xs text-zinc-400">Loading more...</span>
            </div>
          {/if}

          {#if !hasMore && filteredOrders.length > 0}
            <div class="flex items-center justify-center py-6">
              <span class="text-xs text-zinc-300">End of history</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: 4px;
  }

  .animate-modal-in {
    animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes modalIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-spin {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
