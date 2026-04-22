<script lang="ts">
  import type { ActiveOrderItem, Order } from "../main/types";
  import { fmt } from "../main/utils";

  let {
    activeOrder,
    onSelectProduct,
  }: {
    activeOrder: Order | null;
    onSelectProduct: (product: ActiveOrderItem) => void;
  } = $props();
</script>

<div class="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden min-h-0 relative">
  <!-- Empty state illustration -->
  {#if !activeOrder || activeOrder.items.length === 0}
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 z-20 bg-white">
      <div class="relative">
        <div class="absolute -top-1 -right-1 w-16 h-20 bg-zinc-100 border border-zinc-200 rounded-lg rotate-6"></div>
        <div class="absolute -top-0.5 -right-0.5 w-16 h-20 bg-zinc-50 border border-zinc-200 rounded-lg rotate-3"></div>
        <div class="relative w-16 h-20 bg-white border border-zinc-200 rounded-lg shadow-md flex flex-col items-center justify-center gap-1.25 p-2.5">
          <div class="w-full h-1.25 bg-zinc-100 rounded-full"></div>
          <div class="w-4/5 h-1 bg-zinc-100 rounded-full"></div>
          <div class="w-full h-1 bg-zinc-100 rounded-full"></div>
          <div class="w-3/5 h-1 bg-zinc-100 rounded-full"></div>
          <div class="w-px h-1.5 bg-zinc-200 my-px"></div>
          <div class="w-full h-1.25 bg-zinc-200 rounded-full"></div>
        </div>
        <div class="absolute -bottom-2 -right-2 w-5 h-5 bg-[#0A0A0A] rounded-full flex items-center justify-center shadow">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19" />
          </svg>
        </div>
      </div>
      <div class="text-center">
        <p class="text-base font-bold text-[#0A0A0A] mb-1">Order is empty</p>
        <p class="text-xs text-zinc-400 font-medium leading-relaxed max-w-50">Browse the catalog or scan a product to get started.</p>
      </div>
    </div>
  {/if}

  <!-- Items table -->
  <div class="w-full h-full overflow-y-auto table-scrollbar-container box-border">
    <table class="w-full text-left border-collapse">
      <thead class="bg-[#0A0A0A] sticky top-0 z-10">
        <tr>
          <th class="w-12 py-2 pl-4 pr-2"></th>
          <th class="py-2 px-2 text-xs font-bold tracking-[0.08em] uppercase text-white/80">Item</th>
          <th class="w-25 py-2 px-2 text-xs font-bold tracking-[0.08em] uppercase text-white/80">Price</th>
          <th class="w-15 py-2 px-2 text-xs font-bold tracking-[0.08em] uppercase text-white/80 text-center">Qty</th>
          <th class="w-25 py-2 pl-2 pr-4 text-xs font-bold tracking-[0.08em] uppercase text-white/80 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {#each activeOrder?.items as item (item.id)}
          {@const isSelected = item.id === activeOrder?.currentSelectedItem?.id}
          <tr
            class="border-b border-zinc-100 cursor-pointer transition-colors {isSelected ? 'bg-zinc-100' : 'hover:bg-neutral-50'}"
            onclick={(e) => {
              e.stopPropagation();
              onSelectProduct(item);
            }}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectProduct(item);
              }
            }}
            tabindex="0"
            aria-selected={isSelected}
          >
            <td class="py-2 pl-4 pr-2">
              <div class="w-8 h-8 rounded-md overflow-hidden bg-zinc-300 flex items-center justify-center">
                {#if item.productImage}
                  <img src={item.productImage} alt="" class="w-full h-full object-cover" />
                {:else}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                {/if}
              </div>
            </td>
            <td class="py-2 px-2 min-w-30">
              <p class="text-sm font-medium text-[#0A0A0A] truncate">{item.productName}</p>
              <p class="text-xs text-zinc-400 mt-px">{item.category}</p>
            </td>
            <td class="py-2 px-2">
              <div class="font-['DM_Mono',monospace] text-sm font-medium text-zinc-600">{fmt(item.price)}</div>
            </td>
            <td class="py-2 px-2 text-center">
              <div class="font-['DM_Mono',monospace] text-sm font-medium text-zinc-700">{item.qty}</div>
            </td>
            <td class="py-2 pl-2 pr-4 text-right">
              <div class="font-['DM_Mono',monospace] text-sm font-medium text-[#0A0A0A]">{fmt(item.price * item.qty)}</div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-scrollbar-container {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .table-scrollbar-container::-webkit-scrollbar {
    display: none;
  }
</style>
