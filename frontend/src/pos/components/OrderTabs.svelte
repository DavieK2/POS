<script lang="ts">
  import type { Order } from "../main/types";
  import { fmt, orderTotal } from "../main/utils";


  interface Props {
    activeOrder: Order | null | undefined;
    orders: Order[];
    isLocked: boolean;
    isEmpty: boolean;
    onSelectOrder: (order: Order) => void;
    onNewOrder: () => void;
    onShowHistory: () => void;
  }
  let {
    activeOrder,
    orders,
    isLocked,
    isEmpty,
    onSelectOrder,
    onNewOrder,
    onShowHistory,
  }: Props = $props();

  const otherOrders = $derived(orders.filter((o) => o.id !== activeOrder?.id));
</script>

<div class="flex items-center gap-2 h-10 shrink-0">
  <!-- Order pill tabs -->
  <div class="flex gap-1.5 overflow-x-auto flex-1 hide-scrollbar">
    {#each otherOrders as o (o.id)}
      {@const t = orderTotal(o)}
      <button
        class="flex items-center gap-2 bg-white border rounded-full px-3 h-9 whitespace-nowrap shrink-0 transition-all border-zinc-200
               {isLocked ? 'opacity-40 cursor-not-allowed pointer-events-none grayscale' : 'hover:border-zinc-400'}"
        onclick={(e) => { e.stopPropagation(); onSelectOrder(o); }}
        aria-label="Switch to order #{o.id}"
      >
        <span class="w-2 h-2 rounded-full {o.status === 'held' ? 'bg-amber-500' : 'bg-green-500'} shrink-0 animate-pulse"></span>
        <span class="text-sm text-zinc-500 font-medium pr-2 border-r border-zinc-200">#{o.id}</span>
        <span class="text-sm font-medium text-zinc-500">
          { fmt(t) }
        </span>
      </button>
    {/each}
  </div>

  <!-- Action buttons -->
  <div class="flex gap-0.75 bg-zinc-200 p-1 rounded-[10px] shrink-0">
    <button
      onclick={(e) => { e.stopPropagation(); onNewOrder(); }}
      class="text-white border-none rounded-[7px] p-[5px_14px] text-sm font-medium cursor-pointer transition-colors
             {isLocked
               ? 'bg-zinc-400 cursor-not-allowed'
               : activeOrder?.items.length === 0
                 ? 'bg-zinc-400 opacity-60 cursor-not-allowed'
                 : 'bg-[#0A0A0A] hover:opacity-80'}"
    >
      New Order
    </button>

    <button
      onclick={(e) => { e.stopPropagation(); onShowHistory(); }}
      class="text-zinc-700 border-none rounded-[7px] p-[5px_14px] text-sm font-medium cursor-pointer flex items-center gap-1.25 hover:bg-black/5 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      History
    </button>
  </div>
</div>

<style>
  .hide-scrollbar::-webkit-scrollbar { display: none; }
</style>