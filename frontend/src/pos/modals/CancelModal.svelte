<script lang="ts">
  import type { Order } from "../main/types";

  interface Props {
    activeOrder: Order | null;
    onConfirm: (order: Order) => void;
    onClose: () => void;
  }
  let { activeOrder, onConfirm, onClose }: Props = $props();
</script>

<div
  class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="cancel-modal-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[20px] w-full max-w-[320px] shadow-2xl p-6 text-center animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>

    <h3 id="cancel-modal-title" class="text-lg font-bold text-[#0A0A0A] mb-2">Cancel Order?</h3>
    <p class="text-sm text-zinc-500 mb-6">
      Are you sure you want to cancel Order #{activeOrder?.orderId}? This action cannot be undone.
    </p>

    <div class="flex gap-2">
      <button
        onclick={onClose}
        class="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        Keep Order
      </button>
      <button
        onclick={ () => onConfirm(activeOrder!)}
        class="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all"
      >
        Cancel Order
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