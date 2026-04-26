<script lang="ts">
  import { cn } from "../utils";

  interface Props {
    label?: string;
    loading?: boolean;
    disabled?: boolean;
    onclick?: () => void;
  }

  let {
    label = "Submit",
    loading = false,
    disabled = false,
    onclick,
  }: Props = $props();

  const isDisabled = $derived(disabled || loading);
</script>

<button
  type="submit"
  {onclick}
  disabled={isDisabled}
  class={ cn(`flex-1 px-4 py-2.5 bg-black text-white rounded-xl font-medium transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none
    ${isDisabled} ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800'}`)}
>
  {#if loading}
    <span class="flex items-center justify-center gap-2">
      <svg
        class="animate-spin h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Loading...
    </span>
  {:else}
    {label}
  {/if}
</button>