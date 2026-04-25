<script lang="ts">
  import { fmt } from "../main/utils";

  interface Props {
    subtotal: number;
    draftDiscount: string;
    onSave: () => void;
    onClose: () => void;
  }
  let { subtotal, draftDiscount = $bindable(), onSave, onClose }: Props = $props();

  let isSaving = $state(false);

  const handleSave = async () => {
    isSaving = true;
    try {
      await Promise.resolve(onSave());
    } finally {
      isSaving = false;
    }
  };
</script>

<div
  class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="discount-modal-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[20px] w-full max-w-75 shadow-2xl p-5 animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <h3 id="discount-modal-title" class="text-lg font-bold text-[#0A0A0A] mb-1">Apply Discount</h3>
    <p class="text-xs text-zinc-400 mb-4">Maximum allowed: {fmt(subtotal)}</p>

    <div class="relative mb-5">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold" aria-hidden="true">₦</span>
      <input
        bind:value={draftDiscount}
        type="number"
        placeholder="0"
        aria-label="Discount amount in Naira"
        disabled={isSaving}
        class="w-full pl-7 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none
               focus:border-zinc-400 font-['DM_Mono',monospace] text-lg text-[#0A0A0A] hide-spinners
               disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>

    <div class="flex gap-2">
      <button
        onclick={onClose}
        disabled={isSaving}
        class="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors
               disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onclick={handleSave}
        disabled={isSaving}
        class="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:opacity-80 active:scale-95 transition-all
               disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        {#if isSaving}
          <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2v4" stroke-linecap="round"/>
            <path d="M12 18v4" stroke-linecap="round" opacity="0.3"/>
            <path d="M4.93 4.93l2.83 2.83" stroke-linecap="round"/>
            <path d="M16.24 16.24l2.83 2.83" stroke-linecap="round" opacity="0.3"/>
            <path d="M2 12h4" stroke-linecap="round" opacity="0.3"/>
            <path d="M18 12h4" stroke-linecap="round" opacity="0.3"/>
            <path d="M4.93 19.07l2.83-2.83" stroke-linecap="round" opacity="0.3"/>
            <path d="M16.24 7.76l2.83-2.83" stroke-linecap="round" opacity="0.3"/>
          </svg>
          Applying...
        {:else}
          Apply
        {/if}
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