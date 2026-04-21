<script lang="ts">
  import { fmt } from "../main/utils";


  interface Props {
    subtotal: number;
    draftDiscount: string;
    onSave: () => void;
    onClose: () => void;
  }
  let { subtotal, draftDiscount = $bindable(), onSave, onClose }: Props = $props();
</script>

<div
  class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="discount-modal-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[20px] w-full max-w-[300px] shadow-2xl p-5 animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <h3 id="discount-modal-title" class="text-[18px] font-bold text-[#0A0A0A] mb-1">Apply Discount</h3>
    <p class="text-[12px] text-zinc-400 mb-4">Maximum allowed: {fmt(subtotal)}</p>

    <div class="relative mb-5">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold" aria-hidden="true">₦</span>
      <input
        bind:value={draftDiscount}
        type="number"
        placeholder="0"
        aria-label="Discount amount in Naira"
        class="w-full pl-7 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-[12px] outline-none
               focus:border-zinc-400 font-['DM_Mono',monospace] text-[18px] text-[#0A0A0A] hide-spinners"
      />
    </div>

    <div class="flex gap-2">
      <button
        onclick={onClose}
        class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onclick={onSave}
        class="flex-1 py-2.5 rounded-[12px] bg-[#0A0A0A] text-white text-[14px] font-semibold hover:opacity-80 active:scale-95 transition-all"
      >
        Apply
      </button>
    </div>
  </div>
</div>

<style>
  .hide-spinners::-webkit-outer-spin-button,
  .hide-spinners::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .hide-spinners { -moz-appearance: textfield; }
  .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
</style>