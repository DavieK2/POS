<script lang="ts">
  import type { EnrichedItem, Order, PaymentMethod } from "../main/types";
  import { fmt, paymentOptions } from "../main/utils";


  interface Props {
    activeOrder: Order | null;
    total: number;
    payMethod: PaymentMethod;
    onPayMethodChange: (m: PaymentMethod) => void;
    onClose: () => void;
    onConfirm: () => void;
  }
  let {
    activeOrder,
    total,
    payMethod,
    onPayMethodChange,
    onClose,
    onConfirm,
  }: Props = $props();

  const hasDiscount = $derived((activeOrder?.discount ?? 0) > 0);
</script>

<div
  class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="pay-modal-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[20px] w-full max-w-85 shadow-2xl overflow-hidden animate-slide-up max-h-[90vh]"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div class="bg-[#0A0A0A] p-5">
      <p class="text-[12px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">
        Pay Order #{activeOrder?.id}
      </p>
      <p id="pay-modal-title" class="font-['DM_Mono',monospace] text-[42px] font-medium text-white leading-none tracking-[-0.02em]">
        {fmt(total)}
      </p>
      {#if hasDiscount}
        <p class="text-[13px] text-green-300/80 font-medium mt-1">
          Discount of {fmt(activeOrder!.discount)} applied
        </p>
      {/if}
    </div>

    <!-- Body -->
    <div class="p-5">
      <p class="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-3">Payment Method</p>

      <!-- Method picker -->
      <div class="grid grid-cols-3 gap-2 mb-5">
        {#each paymentOptions as m}
          <button
            onclick={() => onPayMethodChange(m.id)}
            aria-pressed={payMethod === m.id}
            class="flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all
                   {payMethod === m.id ? 'border-[#0A0A0A] bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}"
          >
            <span class="text-xs font-semibold tracking-[0.06em] uppercase {payMethod === m.id ? 'text-[#0A0A0A]' : 'text-zinc-400'}">
              {m.label}
            </span>
          </button>
        {/each}
      </div>

      <!-- Items summary -->
      <div class="bg-zinc-50 rounded-xl p-3 mb-3 divide-y divide-zinc-200 max-h-36 overflow-y-auto custom-scrollbar">
        {#each activeOrder!.items as item}
          <div class="flex justify-between items-center py-1.5 first:pt-0 last:pb-0">
            <span class="text-sm font-medium text-zinc-600 truncate max-w-40">
              {item.productName} ×{item.qty}
            </span>
            <span class="font-['DM_Mono',monospace] text-sm font-medium text-zinc-800">
              {fmt(item.price * item.qty)}
            </span>
          </div>
        {/each}
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          onclick={onClose}
          class="flex-1 py-3 rounded-xl border border-zinc-200 text-base font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onclick={onConfirm}
          class="flex-1 py-3 rounded-xl bg-[#0A0A0A] text-white text-base font-semibold hover:opacity-80 active:scale-95 transition-all"
        >
          Confirm
        </button>
      </div>
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