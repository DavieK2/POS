<script lang="ts">
  interface Props {
    isDetectingPrinters: boolean;
    printers: string[];
    selectedPrinter: string;
    onRefresh: () => void;
    onSave: () => void;
    onClose: () => void;
  }
  let {
    isDetectingPrinters,
    printers,
    selectedPrinter = $bindable(),
    onRefresh,
    onSave,
    onClose,
  }: Props = $props();
</script>

<div
  class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[20px] w-full max-w-[380px] shadow-2xl p-6 animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <!-- Title -->
    <div class="flex items-center gap-3 mb-5">
      <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
      </div>
      <div>
        <h3 class="text-[18px] font-bold text-[#0A0A0A]">Hardware Settings</h3>
        <p class="text-[13px] text-zinc-500 font-medium">Configure local peripherals</p>
      </div>
    </div>

    <!-- Printer selector -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <label class="text-[12px] font-bold tracking-[0.08em] uppercase text-zinc-400">Target Printer</label>
        <button onclick={onRefresh} class="text-[12px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          Refresh
        </button>
      </div>

      {#if isDetectingPrinters}
        <div class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] flex items-center gap-3">
          <div class="w-4 h-4 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin"></div>
          <span class="text-[14px] text-zinc-600 font-medium">Scanning local service ports...</span>
        </div>
      {:else if printers.length === 0}
        <div class="w-full p-3 bg-amber-50 border border-amber-200 rounded-[12px] text-[13px] text-amber-700 font-medium">
          Could not detect QZ Tray or local print proxy. Using OS default.
        </div>
      {:else}
        <div class="relative">
          <select
            bind:value={selectedPrinter}
            class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] outline-none
                   focus:border-zinc-400 text-[14px] text-[#0A0A0A] font-medium appearance-none cursor-pointer"
          >
            {#each printers as p}
              <option value={p}>{p}</option>
            {/each}
          </select>
          <svg
            class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        onclick={onClose}
        class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        Close
      </button>
      <button
        onclick={onSave}
        class="flex-1 py-2.5 rounded-[12px] bg-[#0A0A0A] text-white text-[14px] font-semibold hover:opacity-80 active:scale-95 transition-all"
      >
        Save Changes
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