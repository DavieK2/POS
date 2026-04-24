<script lang="ts">
  import type { Order, PaymentMethod } from "../main/types";
  import { fmt } from "../main/utils";

  interface Props {
    activeOrder: Order | null;
    total: number;
    payMethod: PaymentMethod;
    onConfirmAndPrint: () => void;
    onConfirm: () => void;
    onClose: () => void;
  }
  let { activeOrder, total, payMethod, onConfirmAndPrint, onConfirm, onClose }: Props = $props();

  let loadingAction = $state<'print' | 'confirm' | null>(null);

  const handleConfirmAndPrint = async () => {
    loadingAction = 'print';
    try {
      await Promise.resolve(onConfirmAndPrint());
    } finally {
      loadingAction = null;
    }
  };

  const handleConfirm = async () => {
    loadingAction = 'confirm';
    try {
      await Promise.resolve(onConfirm());
    } finally {
      loadingAction = null;
    }
  };
</script>

<div
  class="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="pay-confirm-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-3xl w-full max-w-85 shadow-2xl overflow-hidden animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="flex flex-col items-center pt-8 pb-6 px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" stroke-width="2" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </div>
      <p id="pay-confirm-title" class="text-[20px] font-bold text-[#0A0A0A] mb-1">Confirm Payment?</p>
      <p class="text-[14px] text-zinc-500">
        Order <span class="font-semibold text-zinc-700">#{activeOrder?.orderId}</span>
        &bull;
        <span class="font-['DM_Mono',monospace] font-semibold text-zinc-700">{fmt(total)}</span>
        via
        <span class="capitalize font-semibold text-zinc-700">{payMethod}</span>
      </p>
    </div>

    <div class="px-5 pb-5 flex flex-col gap-2">
      <button
        onclick={handleConfirmAndPrint}
        disabled={loadingAction !== null}
        class="w-full py-3 rounded-xl bg-zinc-800 text-white text-[15px] font-medium hover:bg-zinc-700
               active:scale-95 transition-all flex items-center justify-center gap-2
               disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {#if loadingAction === 'print'}
          <svg class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2v4" stroke-linecap="round"/>
            <path d="M12 18v4" stroke-linecap="round" opacity="0.3"/>
            <path d="M4.93 4.93l2.83 2.83" stroke-linecap="round"/>
            <path d="M16.24 16.24l2.83 2.83" stroke-linecap="round" opacity="0.3"/>
            <path d="M2 12h4" stroke-linecap="round" opacity="0.3"/>
            <path d="M18 12h4" stroke-linecap="round" opacity="0.3"/>
            <path d="M4.93 19.07l2.83-2.83" stroke-linecap="round" opacity="0.3"/>
            <path d="M16.24 7.76l2.83-2.83" stroke-linecap="round" opacity="0.3"/>
          </svg>
          Processing...
        {:else}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
          </svg>
          Confirm &amp; Print Receipt
        {/if}
      </button>

      <button
        onclick={handleConfirm}
        disabled={loadingAction !== null}
        class="w-full py-3 rounded-xl bg-gray-500 text-white text-[15px] font-medium hover:opacity-80 
               active:scale-95 transition-all flex items-center justify-center gap-2
               disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {#if loadingAction === 'confirm'}
          <svg class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2v4" stroke-linecap="round"/>
            <path d="M12 18v4" stroke-linecap="round" opacity="0.3"/>
            <path d="M4.93 4.93l2.83 2.83" stroke-linecap="round"/>
            <path d="M16.24 16.24l2.83 2.83" stroke-linecap="round" opacity="0.3"/>
            <path d="M2 12h4" stroke-linecap="round" opacity="0.3"/>
            <path d="M18 12h4" stroke-linecap="round" opacity="0.3"/>
            <path d="M4.93 19.07l2.83-2.83" stroke-linecap="round" opacity="0.3"/>
            <path d="M16.24 7.76l2.83-2.83" stroke-linecap="round" opacity="0.3"/>
          </svg>
          Processing...
        {:else}
          Confirm
        {/if}
      </button>

      <button
        onclick={onClose}
        disabled={loadingAction !== null}
        class="w-full py-3 rounded-xl border border-zinc-200 text-[15px] font-medium text-zinc-500 
               hover:bg-zinc-50 hover:text-zinc-700 transition-colors
               disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Close
      </button>
    </div>
  </div>
</div>

<style>
  .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
</style>