<script lang="ts">
  interface Props {
    onPress: (val: string) => void;
    onClose: () => void;
  }
  let { onPress, onClose }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="absolute top-[calc(100%+8px)] left-42.5 -translate-x-1/2 bg-white border border-zinc-200
         rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3 w-55 z-50 animate-slide-up"
  role="dialog"
  aria-label="Quantity numpad"
  tabindex="-1"
  onmousedown={(e) => e.preventDefault()}
  onclick={(e) => e.stopPropagation()}
  onkeydown={(e) => e.stopPropagation()}
>
  <div class="grid grid-cols-3 gap-2 mb-2">
    {#each ["1","2","3","4","5","6","7","8","9"] as num}
      <button
        onclick={() => onPress(num)}
        class="h-11 bg-zinc-50 border border-zinc-200 rounded-[10px] text-[18px] font-semibold
               text-[#0A0A0A] hover:bg-zinc-100 active:scale-95 transition-all"
      >
        {num}
      </button>
    {/each}

    <button
      onclick={() => onPress("clear")}
      class="h-11 bg-zinc-50 border border-zinc-200 rounded-[10px] text-[14px] font-bold
             text-zinc-600 hover:bg-zinc-100 active:scale-95 transition-all uppercase tracking-wider"
    >
      C
    </button>

    <button
      onclick={() => onPress("0")}
      class="h-11 bg-zinc-50 border border-zinc-200 rounded-[10px] text-[18px] font-semibold
             text-[#0A0A0A] hover:bg-zinc-100 active:scale-95 transition-all"
    >
      0
    </button>

    <button
      aria-label="Backspace"
      onclick={() => onPress("backspace")}
      class="h-11 bg-zinc-100 border border-zinc-200 rounded-[10px] flex items-center justify-center
             text-zinc-600 hover:bg-zinc-200 active:scale-95 transition-all"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
        <line x1="18" y1="9" x2="12" y2="15" />
        <line x1="12" y1="9" x2="18" y2="15" />
      </svg>
    </button>
  </div>

  <button
    onclick={onClose}
    class="w-full h-11 bg-[#0A0A0A] text-white rounded-[10px] text-[15px] font-bold
           hover:opacity-80 active:scale-95 transition-all"
  >
    Done
  </button>
</div>

<style>
  .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px) translateX(-50%) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)     translateX(-50%) scale(1); }
  }
</style>