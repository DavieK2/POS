<script lang="ts">
  import type { Order } from "../main/types";
  import { fmt } from "../main/utils";

  

  interface Props {
    isEmpty: boolean;
    isHeld: boolean;
    activeOrder: Order | null;
    onOpenNote: () => void;
    onHoldOrder: () => void;
    onOpenDiscount: () => void;
    onOpenCancel: () => void;
  }
  let {
    isEmpty,
    isHeld,
    activeOrder,
    onOpenNote,
    onHoldOrder,
    onOpenDiscount,
    onOpenCancel,
  }: Props = $props();

  const hasNote     = $derived(!!(activeOrder?.note));
  const hasDiscount = $derived((activeOrder?.discount ?? 0) > 0);
</script>

<div class="grid grid-cols-4 gap-2 flex-shrink-0">

  <!-- Add / Edit Note -->
  <button
    onclick={(e) => { e.stopPropagation(); onOpenNote(); }}
    class="cursor-pointer bg-white border rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px]
           text-[14px] font-medium transition-colors
           {isEmpty || isHeld
             ? 'opacity-40 pointer-events-none border-zinc-200 text-zinc-700'
             : hasNote
               ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
               : 'border-zinc-200 text-zinc-700 hover:bg-neutral-50 hover:border-zinc-300'}"
  >
    <svg class="size-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10.5V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H12M14 11H8M10 15H8M16 7H8M18 21V15M15 18H21"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="pt-1">{hasNote ? "Edit Note" : "Add Note"}</span>
  </button>

  <!-- Hold / Resume -->
  <button
    onclick={(e) => { e.stopPropagation(); onHoldOrder(); }}
    class="cursor-pointer bg-white border rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px]
           text-[14px] font-medium transition-colors
           {isEmpty
             ? 'opacity-40 pointer-events-none border-zinc-200 text-zinc-700'
             : isHeld
               ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
               : 'border-zinc-200 text-zinc-700 hover:bg-neutral-50 hover:border-zinc-300'}"
  >
    <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 9L9 15M15 9L15 15M7.8 21H16.2C17.88 21 18.72 21 19.36 20.67A3 3 0 0 0 20.67 19.36C21 18.72 21 17.88 21 16.2V7.8C21 6.12 21 5.28 20.67 4.64A3 3 0 0 0 19.36 3.33C18.72 3 17.88 3 16.2 3H7.8C6.12 3 5.28 3 4.64 3.33A3 3 0 0 0 3.33 4.64C3 5.28 3 6.12 3 7.8V16.2C3 17.88 3 18.72 3.33 19.36A3 3 0 0 0 4.64 20.67C5.28 21 6.12 21 7.8 21Z" />
    </svg>
    <span class="pt-px">{isHeld ? "Resume" : "Hold Order"}</span>
  </button>

  <!-- Discount -->
  <button
    onclick={(e) => { e.stopPropagation(); onOpenDiscount(); }}
    class="cursor-pointer bg-white border rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px]
           text-[14px] font-semibold transition-colors
           {isEmpty || isHeld
             ? 'opacity-40 pointer-events-none border-zinc-200 text-zinc-700'
             : hasDiscount
               ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
               : 'border-zinc-200 text-zinc-700 hover:bg-neutral-50 hover:border-zinc-300'}"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
    <span class="pt-px">{hasDiscount ? `−${fmt(activeOrder!.discount)}` : "Discount"}</span>
  </button>

  <!-- Cancel Order -->
  <button
    onclick={(e) => { e.stopPropagation(); onOpenCancel(); }}
    class="cursor-pointer bg-white border border-zinc-200 rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px]
           text-[14px] font-medium text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors
           {isEmpty || isHeld ? 'opacity-40 pointer-events-none' : ''}"
  >
    <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.88 21 18.72 21 19.36 20.67A3 3 0 0 0 20.67 19.36C21 18.72 21 17.88 21 16.2V7.8C21 6.12 21 5.28 20.67 4.64A3 3 0 0 0 19.36 3.33C18.72 3 17.88 3 16.2 3H7.8C6.12 3 5.28 3 4.64 3.33A3 3 0 0 0 3.33 4.64C3 5.28 3 6.12 3 7.8V16.2C3 17.88 3 18.72 3.33 19.36A3 3 0 0 0 4.64 20.67C5.28 21 6.12 21 7.8 21Z" />
    </svg>
    <span class="pt-px">Cancel Order</span>
  </button>

</div>