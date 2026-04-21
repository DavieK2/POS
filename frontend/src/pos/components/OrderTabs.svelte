<script lang="ts">
  import type { Order } from "../main/types";
  import { fmt, orderItems, orderTotal } from "../main/utils";


  interface Props {
    orders: Order[];
    activeOrderId: string | null;
    isLocked: boolean;
    isEmpty: boolean;
    onSelectOrder: (id: string) => void;
    onNewOrder: () => void;
    onShowHistory: () => void;
  }
  let {
    orders,
    activeOrderId,
    isLocked,
    isEmpty,
    onSelectOrder,
    onNewOrder,
    onShowHistory,
  }: Props = $props();

  const otherOrders = $derived(orders.filter((o) => o.id !== activeOrderId));
</script>

<div class="flex items-center gap-2 h-10 shrink-0">
  <!-- Order pill tabs -->
  <div class="flex gap-1.5 overflow-x-auto flex-1 hide-scrollbar">
    {#each otherOrders as o (o.id)}
      {@const t = orderTotal(o)}
      <button
        class="flex items-center gap-2 bg-white border rounded-full px-3 h-9 whitespace-nowrap shrink-0 transition-all border-zinc-200
               {isLocked ? 'opacity-40 cursor-not-allowed pointer-events-none grayscale' : 'hover:border-zinc-400'}"
        onclick={(e) => { e.stopPropagation(); onSelectOrder(o.id); }}
        aria-label="Switch to order #{o.id}"
      >
        <span class="w-1.5 h-1.5 rounded-full {o.status === 'held' ? 'bg-amber-500' : 'bg-green-500'} shrink-0"></span>
        <span class="text-[13px] text-zinc-400 font-medium pr-2 border-r border-zinc-200">#{o.id}</span>
        <span class="font-['DM_Mono',monospace] text-[14px] font-medium text-zinc-500">
          {orderItems(o).length ? fmt(t) : "Empty"}
        </span>
      </button>
    {/each}
  </div>

  <!-- Action buttons -->
  <div class="flex gap-0.75 bg-zinc-200 p-1 rounded-[10px] shrink-0">
    <button
      onclick={(e) => { e.stopPropagation(); onNewOrder(); }}
      class="text-white border-none rounded-[7px] p-[5px_14px] text-[14px] font-medium cursor-pointer transition-colors
             {isLocked
               ? 'bg-zinc-400 cursor-not-allowed'
               : isEmpty || activeOrderId === null
                 ? 'bg-zinc-400 opacity-60 cursor-not-allowed'
                 : 'bg-[#0A0A0A] hover:opacity-80'}"
    >
      New Order
    </button>

    <button
      onclick={(e) => { e.stopPropagation(); onShowHistory(); }}
      class="text-zinc-500 border-none rounded-[7px] p-[5px_14px] text-[14px] font-medium cursor-pointer flex items-center gap-1.25 hover:bg-black/5 transition-colors"
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