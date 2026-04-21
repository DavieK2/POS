<script lang="ts">
  import type { ActiveOrderItem } from "../main/types";
  import { fmt } from "../main/utils";

  import Numpad from "./Numpad.svelte";

  interface Props {
    currentSelectedItem: ActiveOrderItem | null | undefined;
    isHeld: boolean;
    onDecQty: (product: ActiveOrderItem) => void;
    onIncQty: (product: ActiveOrderItem) => void;
    updateQty: (product: ActiveOrderItem, q: number) => void;
    onRemoveItem: (product: ActiveOrderItem ) => void;
    onOpenNumpad: (product: ActiveOrderItem) => void;
  }
  let { currentSelectedItem, isHeld, onDecQty, onIncQty, updateQty, onRemoveItem, onOpenNumpad }: Props = $props();

  let isNumpadOpen = $state(false);
  let inputValue: string = $derived(currentSelectedItem?.qty.toString() || "")

  function numpadPress( val: string): void {
    
        let current = inputValue;

        if      (val === "backspace") current = current.slice(0, -1);
        else if (val === "clear")     current = "1";
        else                          current += val; 
        
        inputValue = current;
        updateQty( currentSelectedItem!, (inputValue === "" ? 1 : parseInt(inputValue)) )
  }

</script>

{#if currentSelectedItem}
  <div
    class="bg-white border border-zinc-200 rounded-[16px] p-[14px] flex gap-[14px] flex-shrink-0 relative
           {isHeld ? 'opacity-60 pointer-events-none' : ''}"
  >
    <!-- Product image -->
    <div class="w-[100px] h-[100px] bg-zinc-100 rounded-[12px] overflow-hidden flex-shrink-0">
      <img src={currentSelectedItem.productImage} alt={currentSelectedItem.productName} class="w-full h-full object-cover mix-blend-multiply" />
    </div>

    <!-- Product info + qty controls -->
    <div class="flex-1 flex flex-col justify-between">
      <div>
        <p class="text-2xl font-bold text-[#0A0A0A] leading-tight mb-[3px]">{currentSelectedItem.productName}</p>
        <p class="font-['DM_Mono',monospace] text-[14px] text-zinc-500">{fmt(currentSelectedItem.price)}/piece</p>
      </div>

      <div class="flex justify-between items-end mt-[10px]">
        <!-- Qty stepper + numpad anchor -->
        <div class="flex items-center gap-2.5 bg-zinc-100 rounded-[10px] p-1.25 relative">
          <button
            aria-label="Decrease quantity"
            onclick={(e) => {
              e.stopPropagation();
              onDecQty(currentSelectedItem);
            }}
            class="w-7.5 h-[30px] bg-white border border-zinc-200 rounded-[7px] text-[20px]
                   flex items-center justify-center leading-none hover:bg-zinc-50
                   active:scale-90 active:bg-zinc-200 transition-all">−</button
          >

          <input
            type="text"
            id="qty-input"
            bind:value={inputValue}
            aria-label="Item quantity"
            onfocus={(e) => {
              e.stopPropagation();
              onOpenNumpad(currentSelectedItem);
              isNumpadOpen = true;
            }}
            onclick={(e) => {
              e.stopPropagation();
              onOpenNumpad(currentSelectedItem);
              isNumpadOpen = true;
            }}
            oninput={(e) =>{
                e.stopPropagation();
                const val = e.currentTarget.value.replace(/[^0-9]/g, "");
                updateQty( currentSelectedItem, (val === "" ? 1 : parseInt(val)) )            
            }}
            onblur={ () => isNumpadOpen = false }
            class="w-10 text-center bg-transparent font-['DM_Mono',monospace] text-[18px]
                   font-medium text-[#0A0A0A] outline-none hide-spinners m-0 p-0 cursor-pointer"
            readonly={isHeld}
          />

          <button
            aria-label="Increase quantity"
            onclick={(e) => {
              e.stopPropagation();
              onIncQty(currentSelectedItem);
            }}
            class="w-7.5 h-7.5 bg-white border border-zinc-200 rounded-[7px] text-[20px]
                   flex items-center justify-center leading-none hover:bg-zinc-50
                   active:scale-90 active:bg-zinc-200 transition-all">+</button
          >

          {#if isNumpadOpen}
            <Numpad
              onPress={(val) => numpadPress(val)}
              onClose={() => isNumpadOpen = false}
            />
          {/if}
        </div>

        <!-- Line subtotal -->
        <div class="text-right">
          <p class="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-[2px]">Subtotal</p>
          <p class="font-['DM_Mono',monospace] text-[26px] font-semibold text-[#0A0A0A] leading-none">
            {fmt(currentSelectedItem.price * currentSelectedItem.qty)}
          </p>
        </div>
      </div>
    </div>

    <!-- Remove button -->
    <button
      aria-label="Remove {currentSelectedItem.productName} from order"
      onclick={(e) => {
        e.stopPropagation();
        onRemoveItem(currentSelectedItem);
      }}
      class="absolute top-3 right-3 w-7 h-7 bg-zinc-100 border-none rounded-[7px]
             flex items-center justify-center text-zinc-400 cursor-pointer
             hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  </div>
{:else}
  <!-- Empty placeholder shown when order has no items -->
  <div class="bg-white border border-dashed border-zinc-300 rounded-2xl p-5 flex items-center gap-4 shrink-0">
    <div class="w-18 h-18 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300 shrink-0">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    </div>
    <div>
      <p class="text-[16px] font-bold text-zinc-400">No item selected</p>
      <p class="text-[13px] text-zinc-400 font-medium mt-[3px]">Add items from the catalog on the right or scan a barcode</p>
    </div>
  </div>
{/if}

<style>
  .hide-spinners::-webkit-outer-spin-button,
  .hide-spinners::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .hide-spinners {
    -moz-appearance: textfield;
  }
</style>
