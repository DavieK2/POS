<script lang="ts">
  import type { ActiveOrderItem } from "../main/types";
  import { fmt } from "../main/utils";

  

  interface Props {
    isEmpty: boolean;
    activeItems: ActiveOrderItem[];
    currentSelectedItem: ActiveOrderItem | null | undefined;
    onSelectProduct: (product: ActiveOrderItem) => void;
  }
  let { isEmpty, activeItems, currentSelectedItem, onSelectProduct }: Props = $props();
</script>

<div class="flex-1 bg-white border border-zinc-200 rounded-[12px] overflow-hidden min-h-0 relative">

  <!-- Empty state illustration -->
  {#if isEmpty}
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 z-20 bg-white">
      <div class="relative">
        <div class="absolute -top-1 -right-1 w-[64px] h-[80px] bg-zinc-100 border border-zinc-200 rounded-[8px] rotate-[6deg]"></div>
        <div class="absolute -top-0.5 -right-0.5 w-[64px] h-[80px] bg-zinc-50 border border-zinc-200 rounded-[8px] rotate-[3deg]"></div>
        <div class="relative w-[64px] h-[80px] bg-white border border-zinc-200 rounded-[8px] shadow-md flex flex-col items-center justify-center gap-[5px] p-2.5">
          <div class="w-full h-[5px] bg-zinc-100 rounded-full"></div>
          <div class="w-4/5 h-[4px] bg-zinc-100 rounded-full"></div>
          <div class="w-full h-[4px] bg-zinc-100 rounded-full"></div>
          <div class="w-3/5 h-[4px] bg-zinc-100 rounded-full"></div>
          <div class="w-px h-[6px] bg-zinc-200 my-[1px]"></div>
          <div class="w-full h-[5px] bg-zinc-200 rounded-full"></div>
        </div>
        <div class="absolute -bottom-2 -right-2 w-[20px] h-[20px] bg-[#0A0A0A] rounded-full flex items-center justify-center shadow">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19" />
          </svg>
        </div>
      </div>
      <div class="text-center">
        <p class="text-[15px] font-bold text-[#0A0A0A] mb-1">Order is empty</p>
        <p class="text-[13px] text-zinc-400 font-medium leading-relaxed max-w-[200px]">
          Browse the catalog or scan a product to get started.
        </p>
      </div>
    </div>
  {/if}

  <!-- Items table -->
  <div class="w-full h-full overflow-y-auto table-scrollbar-container box-border">
    <table class="w-full text-left border-collapse">
      <thead class="bg-[#0A0A0A] sticky top-0 z-10">
        <tr>
          <th class="w-12 py-2 pl-4 pr-2"></th>
          <th class="py-2 px-2 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80">Item</th>
          <th class="w-[100px] py-2 px-2 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80">Price</th>
          <th class="w-[60px] py-2 px-2 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80 text-center">Qty</th>
          <th class="w-[100px] py-2 pl-2 pr-4 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {#each activeItems as item (item.id)}
          {@const isSelected = item.id === currentSelectedItem?.id}
          <tr
            class="border-b border-zinc-100 cursor-pointer transition-colors {isSelected ? 'bg-zinc-100' : 'hover:bg-neutral-50'}"
            onclick={(e) => { e.stopPropagation(); onSelectProduct(item); }}
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
              <div class="w-8 h-8 rounded-[6px] overflow-hidden bg-zinc-100">
                <img src={item.productImage} alt="" class="w-full h-full object-cover" />
              </div>
            </td>
            <td class="py-2 px-2 min-w-[120px]">
              <p class="text-[14px] font-medium text-[#0A0A0A] truncate">{item.productName}</p>
              <p class="text-[12px] text-zinc-400 mt-[1px]">{item.category}</p>
            </td>
            <td class="py-2 px-2">
              <div class="font-['DM_Mono',monospace] text-[15px] font-medium text-zinc-600">{fmt(item.price)}</div>
            </td>
            <td class="py-2 px-2 text-center">
              <div class="font-['DM_Mono',monospace] text-[15px] font-medium text-zinc-700">{item.qty}</div>
            </td>
            <td class="py-2 pl-2 pr-4 text-right">
              <div class="font-['DM_Mono',monospace] text-[15px] font-medium text-[#0A0A0A]">{fmt(item.price * item.qty)}</div>
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
  .table-scrollbar-container::-webkit-scrollbar { display: none; }
</style>