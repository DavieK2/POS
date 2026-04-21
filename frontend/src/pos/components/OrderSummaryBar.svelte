<script lang="ts">
  import type { EnrichedItem, Order } from "../main/types";
  import { fmt } from "../main/utils";

  

  interface Props {
    isEmpty: boolean;
    isHeld: boolean;
    activeItems: EnrichedItem[];
    subtotal: number;
    total: number;
    activeOrder: Order | null;
    onOpenPay: () => void;
  }
  let { isEmpty, isHeld, activeItems, subtotal, total, activeOrder, onOpenPay }: Props = $props();

  const hasDiscount = $derived((activeOrder?.discount ?? 0) > 0);
</script>

<div class="flex w-full shrink-0">
  <!-- Totals panel -->
  <div class="bg-[#0A0A0A] rounded-2xl p-[14px_20px] flex justify-between items-center w-full h-20">
    <div class="flex gap-7">
      <!-- Items count -->
      <div>
        <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-yellow-300/40 mb-1">Items</p>
        <p class="font-['DM_Mono',monospace] text-[24px] font-medium leading-none
                  {isEmpty ? 'text-white/25' : 'text-yellow-300'}">
          {isEmpty ? "0" : activeItems.length}
        </p>
      </div>

      <!-- Subtotal -->
      <div>
        <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">Subtotal</p>
        <p class="font-['DM_Mono',monospace] text-[24px] font-medium leading-none
                  {isEmpty ? 'text-white/25' : 'text-white'}">
          {isEmpty ? "₦0.00" : fmt(subtotal)}
        </p>
      </div>

      <!-- Discount -->
      <div>
        <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-green-300/50 mb-1">Discount</p>
        <p class="font-['DM_Mono',monospace] text-[24px] font-medium leading-none
                  {hasDiscount ? 'text-green-300' : 'text-white/20'}">
          {hasDiscount ? `−${fmt(activeOrder!.discount)}` : "—"}
        </p>
      </div>
    </div>

    <!-- Grand total -->
    <div class="text-right pr-5">
      <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">Total to Pay</p>
      <p class="font-['DM_Mono',monospace] text-[36px] font-medium leading-none tracking-[-0.02em]
                {isEmpty ? 'text-white/25' : 'text-white'}">
        {isEmpty ? "₦0.00" : fmt(total)}
      </p>
    </div>
  </div>

  <!-- Pay button -->
  <div class="h-20 ml-2">
    <button
      onclick={(e) => { e.stopPropagation(); onOpenPay(); }}
      disabled={isEmpty || isHeld}
      class="px-8 py-2.5 h-20 flex flex-col items-center justify-center rounded-2xl font-bold text-2xl transition-all
             {isEmpty || isHeld
               ? 'bg-zinc-300 text-zinc-400 cursor-not-allowed'
               : 'bg-yellow-500/50 text-black hover:bg-yellow-500/40 active:scale-95 cursor-pointer'}"
    >
      Pay
    </button>
  </div>
</div>