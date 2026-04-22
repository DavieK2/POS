<script lang="ts">
  interface Props {
    dateString: string;
    timeString: string;
    onOpenSettings: () => void;
  }
  let { dateString, timeString, onOpenSettings }: Props = $props();
</script>

<header class="shrink-0 h-12 bg-white border-b border-zinc-200 flex items-center justify-between px-5 z-10">
  <span class="font-['Syne',sans-serif] font-extrabold text-[20px] tracking-[0.2em] uppercase">Vine</span>

  <div class="flex items-center gap-3">
    <span class="text-xs text-zinc-500 min-w-42.5 text-right">
      {dateString} &bull; {timeString}
    </span>

    <div class="w-px h-5.5 bg-zinc-200"></div>

    <div class="flex items-center gap-2 p-[4px_10px_4px_4px] border border-zinc-200 rounded-full bg-neutral-50">
      <div class="w-6.5 h-6.5 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-[12px] font-bold tracking-[0.05em]">
        AJ
      </div>
      <span class="text-xs font-semibold text-zinc-700">Alex J.</span>
    </div>

    <button
      onclick={onOpenSettings}
      aria-label="Settings"
      class="w-8 h-8 border border-zinc-200 flex items-center justify-center text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>

    <button
      aria-label="Sign out"
      class="w-8 h-8 border border-zinc-200 flex items-center justify-center text-red-600 rounded-lg hover:bg-red-50 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  </div>
</header>