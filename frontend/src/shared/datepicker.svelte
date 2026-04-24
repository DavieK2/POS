<script lang="ts">
  interface Props {
    dateFrom?: Date | null;
    dateTo?: Date | null;
    onSelect?: (from: Date | null, to: Date | null) => void;
    onClear?: () => void;
  }

  let {
    dateFrom = $bindable(null),
    dateTo = $bindable(null),
    onSelect,
    onClear,
  }: Props = $props();

  let dateSelectMode = $state<"from" | "to">("from");
  let calendarMonth = $state(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function formatCalendarDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getCalendarDays() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const dim = new Date(year, month + 1, 0).getDate();
    const prevDim = new Date(year, month, 0).getDate();
    const days: { day: number; current: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevDim - i, current: false });
    }
    for (let i = 1; i <= dim; i++) {
      days.push({ day: i, current: true });
    }
    const totalCells = Math.ceil((firstDay + dim) / 7) * 7;
    for (let i = 1; i <= totalCells - days.length; i++) {
      days.push({ day: i, current: false });
    }
    return days;
  }

  function prevMonth() {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  }

  function nextMonth() {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  }

  function selectCalendarDay(day: number, current: boolean) {
    if (!current) {
      if (day > 20) {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
      } else {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
      }
      return;
    }
    const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    if (dateSelectMode === "from") {
      dateFrom = selected;
      if (dateTo && selected > dateTo) dateTo = null;
      dateSelectMode = "to";
    } else {
      dateTo = selected;
      if (dateFrom && selected < dateFrom) {
        dateFrom = selected;
        dateTo = null;
      }
      dateSelectMode = "from";
    }
    onSelect?.(dateFrom, dateTo);
  }

  function isDateSelected(day: number, current: boolean): boolean {
    if (!current) return false;
    const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const check = (target: Date | null) => !!target && d.toDateString() === target.toDateString();
    return check(dateFrom) || check(dateTo);
  }

  function isDateInRange(day: number, current: boolean): boolean {
    if (!current || !dateFrom || !dateTo) return false;
    const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return d > dateFrom && d < dateTo;
  }

  function handleClear() {
    dateFrom = null;
    dateTo = null;
    dateSelectMode = "from";
    onClear?.();
  }
</script>

<div class="mt-3">
  <div class="flex items-center gap-2 mb-2">
    <button
      onclick={() => dateSelectMode = "from"}
      class="flex-1 text-left px-3 py-1.5 rounded-[7px] text-xs font-medium transition-all
             {dateSelectMode === 'from' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}"
    >
      {dateFrom ? dateFrom.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "From date"}
    </button>
    <span class="text-white/30 text-xs">→</span>
    <button
      onclick={() => dateSelectMode = "to"}
      class="flex-1 text-left px-3 py-1.5 rounded-[7px] text-xs font-medium transition-all
             {dateSelectMode === 'to' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}"
    >
      {dateTo ? dateTo.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "To date"}
    </button>
    {#if dateFrom || dateTo}
      <button
        onclick={handleClear}
        class="text-xs text-white/40 hover:text-white font-medium px-2 py-1.5 transition-colors"
      >
        Clear
      </button>
    {/if}
  </div>

  <div class="bg-white/5 rounded-xl p-2.5">
    <div class="flex justify-between items-center px-1 mb-2">
      <button
        onclick={prevMonth}
        class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 transition-colors"
        aria-label="Previous month"
      >
        <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span class="text-xs text-white font-semibold">
        {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
      </span>
      <button
        onclick={nextMonth}
        class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 transition-colors"
        aria-label="Next month"
      >
        <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-7 gap-0.5 text-center">
      {#each ["S", "M", "T", "W", "T", "F", "S"] as d}
        <div class="text-[10px] text-white/30 font-medium py-1">{d}</div>
      {/each}
      {#each getCalendarDays() as { day, current }}
        <button
          class="text-[11px] w-7 h-7 rounded-full transition-colors relative flex items-center justify-center
                 {!current ? 'text-white/20' : ''}
                 {isDateSelected(day, current) ? 'bg-white text-[#0A0A0A] font-bold' : ''}
                 {isDateInRange(day, current) ? 'bg-white/15 text-white' : ''}
                 {current && !isDateSelected(day, current) && !isDateInRange(day, current) ? 'text-white/70 hover:bg-white/10' : ''}"
          onclick={() => selectCalendarDay(day, current)}
        >
          {day}
        </button>
      {/each}
    </div>
  </div>
</div>