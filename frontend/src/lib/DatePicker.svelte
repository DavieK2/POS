<script lang="ts">
  // Svelte 5: Use $props() with $bindable() for two-way binding
  let {
    startDate = $bindable(""),
    endDate = $bindable("")
  }: {
    startDate?: string;
    endDate?: string;
  } = $props();

  // Auto-correct: ensure endDate is not before startDate
  $effect(() => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      endDate = startDate;
    }
  });
</script>

<div class="flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900/20 focus-within:border-black transition-all duration-200 w-full sm:w-auto hover:border-neutral-300 py-0.5">
  
  <!-- Start Date -->
  <div class="relative flex-1 sm:flex-none">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </div>
    <input 
      type="date" 
      bind:value={startDate}
      class="custom-date-input w-full pl-9 pr-3 py-2.5 text-sm bg-transparent outline-none text-neutral-700 cursor-pointer placeholder:text-neutral-400"
      aria-label="Start Date"
    />
  </div>

  <!-- Separator -->
  <div class="flex items-center justify-center px-2 bg-neutral-50 h-full border-x border-neutral-200">
    <span class="text-neutral-400 text-xs font-semibold uppercase tracking-wider select-none">To</span>
  </div>

  <!-- End Date -->
  <div class="relative flex-1 sm:flex-none">
    <input 
      type="date" 
      bind:value={endDate}
      min={startDate || undefined}
      class="custom-date-input w-full px-3 py-2.5 text-sm bg-transparent outline-none text-neutral-700 cursor-pointer placeholder:text-neutral-400"
      aria-label="End Date"
    />
  </div>
</div>

<style>
  /* Hide native calendar icon */
  .custom-date-input::-webkit-calendar-picker-indicator {
    background: transparent;
    cursor: pointer;
    height: 100%;
    width: 100%;
    position: absolute;
    inset: 0;
    opacity: 0;
  }
  
  .custom-date-input::-webkit-datetime-edit {
    padding-left: 0.25rem;
    color: #52525b; /* neutral-700 */
  }

  /* FIXED: Replaced invalid theme() with actual hex values */
  .custom-date-input::-webkit-datetime-edit-text,
  .custom-date-input::-webkit-datetime-edit-month-field,
  .custom-date-input::-webkit-datetime-edit-day-field,
  .custom-date-input::-webkit-datetime-edit-year-field {
    color: #71717a; /* neutral-600 */
  }

  .custom-date-input:invalid::-webkit-datetime-edit,
  .custom-date-input[value=""]::-webkit-datetime-edit {
    color: #a1a1aa; /* neutral-400 */
  }
  
  .custom-date-input:focus { outline: none; }
  
  @media (max-width: 640px) {
    .custom-date-input { font-size: 16px; } /* Prevent iOS zoom */
  }
  
  @media (prefers-color-scheme: dark) {
    .custom-date-input::-webkit-datetime-edit { color: #e4e4e7; }
    .custom-date-input::-webkit-datetime-edit-text,
    .custom-date-input::-webkit-datetime-edit-month-field,
    .custom-date-input::-webkit-datetime-edit-day-field,
    .custom-date-input::-webkit-datetime-edit-year-field {
      color: #a1a1aa;
    }
  }
</style>