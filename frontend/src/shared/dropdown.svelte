<script lang="ts">
  import { onMount } from "svelte";
  import type { DropDownOptions } from "./types";

  let {
    selected = $bindable({ text: 'Select Item', value: '' }),
    options,
    onSelect,
    fullWidth = true
  }: {
    selected: DropDownOptions;
    options: DropDownOptions[];
    onSelect?: (option: DropDownOptions) => void;
    fullWidth?: boolean
  } = $props();

  onMount(() => {
    onSelect?.(selected);
  });

  let openDropdown = $state(false);
  let containerRef: HTMLDivElement | undefined = $state();
  
  let selectedText = $derived(selected.text);

  function toggleDropdown() {
    openDropdown = !openDropdown;
  }

  function onSelected(option: DropDownOptions) {
    selected = option;
    openDropdown = false;
    onSelect?.(option);
  }

 
  function handleFocusOut(event: FocusEvent) {
    if (containerRef && !containerRef.contains(event.relatedTarget as Node)) {
      openDropdown = false;
    }
  }
</script>

<div 
  bind:this={containerRef} 
  onfocusout={handleFocusOut} 
  class="relative min-w-45"
>
  <button
    type="button"
    onclick={toggleDropdown}
    class={[fullWidth && 'w-full', ! fullWidth && 'max-w-min min-w-max', "px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white flex items-center justify-between gap-2 text-left"]}
    aria-haspopup="listbox"
    aria-expanded={openDropdown}
  >
    <span class="text-sm text-gray-600 truncate">{selectedText}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="shrink-0 text-neutral-400 transition-transform {openDropdown ? 'rotate-180' : ''}"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>

  {#if openDropdown}
    <div
      class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 overflow-hidden py-1"
      role="listbox"
    >
      {#each options as option (option.value)}
        <button
          type="button"
          onclick={() => onSelected(option)}
          class="w-full px-4 py-2.5 text-left hover:bg-neutral-50 text-xs transition-colors flex items-center justify-between {selected.value ===
          option.value
            ? 'text-zinc-600 font-medium'
            : 'text-neutral-700'}"
          role="option"
          aria-selected={selected.value === option.value}
        >
          {option.text}
          {#if selected.value === option.value}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>