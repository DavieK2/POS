<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import DatePicker from "../../lib/DatePicker.svelte";
  import Layout from "../layouts/Layout.svelte";

  // Type definitions
  interface Sale {
    id: string;
    date: string;
    time: string;
    mobile: string;
    items: number;
    subtotal: number;
    tax: number;
    total: number;
  }
  type FilterOption = 'All' | 'Today' | 'Week' | 'Month';

  // Svelte 5: $state for reactive state
  let sales = $state<Sale[]>([
    {
      id: "INV1775924269533",
      date: "4/11/2026",
      time: "5:17:49 PM",
      mobile: "—",
      items: 1,
      subtotal: 899.00,
      tax: 161.82,
      total: 1060.82
    },
    {
      id: "INV1775924263056",
      date: "4/11/2026",
      time: "5:17:43 PM",
      mobile: "—",
      items: 1,
      subtotal: 1299.00,
      tax: 233.82,
      total: 1532.82
    }
  ]);

  let searchQuery = $state("");
  let activeFilter = $state<FilterOption>("All");
  let startDate = $state("");
  let endDate = $state("");
  let selectedInvoice = $state<Sale | null>(null);

  const filterOptions: FilterOption[] = ['All', 'Today', 'Week', 'Month'];

  // Svelte 5: $derived for computed values (no $: prefix!)
  const filteredSales = $derived(sales.filter((sale: Sale) => {
    let match = true;
    
    if (searchQuery) {
      match = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
              sale.mobile.includes(searchQuery);
    }
    
    if (match && startDate && endDate) {
      const saleDate = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      match = saleDate >= start && saleDate <= end;
    }
    return match;
  }));

  const stats = $derived({
    total: filteredSales.length,
    revenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
    avg: filteredSales.length 
      ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length 
      : 0
  });

  // Action Handlers
  function openModal(invoice: Sale): void {
    selectedInvoice = invoice;
  }

  function closeModal(): void {
    selectedInvoice = null;
  }

  function printInvoice(): void {
    window.print();
  }

  const formatCurrency = (amount: number): string => `₹${amount.toFixed(2)}`;
</script>

<Layout>
  <div class="flex-1 overflow-auto bg-neutral-50/30">
    <div class="p-4 md:p-8 max-w-7xl mx-auto" in:fade={{ duration: 300 }}>
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-black mb-1">Sales History</h1>
            <p class="text-neutral-500 text-sm">View and manage all sales transactions</p>
          </div>
          <button 
            onclick={() => {}} 
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-neutral-300 disabled:cursor-not-allowed focus:ring-2 focus:ring-neutral-400 focus:outline-none active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            <span class="font-medium">Export CSV</span>
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          {#each [
            { label: 'Total Transactions', value: stats.total, key: 'total' },
            { label: 'Total Revenue', value: formatCurrency(stats.revenue), key: 'revenue' },
            { label: 'Avg Transaction', value: stats.total ? formatCurrency(stats.avg) : '₹0.00', key: 'avg', colspan: 'sm:col-span-2 md:col-span-1' }
          ] as stat, i}
            <div 
              class="bg-white p-5 rounded-xl border border-neutral-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              in:fly={{ y: 20, duration: 400, delay: i * 100, easing: cubicOut }}
            >
              <div class="text-sm text-neutral-500 mb-1 font-medium">{stat.label}</div>
              <div class="text-2xl font-bold text-black">{stat.value}</div>
            </div>
          {/each}
        </div>

        <!-- Filters -->
        <div class="flex flex-col xl:flex-row gap-3">
          <div class="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Search by invoice ID, mobile, or product..." 
              class="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all duration-200 bg-white hover:border-neutral-300" 
            />
          </div>
          
          <div class="flex flex-wrap lg:flex-nowrap items-center gap-2">
            <div class="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
              {#each filterOptions as filter}
                <button 
                  onclick={() => activeFilter = filter}
                  class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none transition-all duration-200 active:scale-[0.98]
                  {activeFilter === filter 
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-black'}">
                  {filter}
                </button>
              {/each}
            </div>
            
            <div class="h-8 w-px bg-neutral-200 hidden lg:block mx-1"></div>
            
            <DatePicker bind:startDate bind:endDate />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px]">
            <thead class="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {#each ['Invoice ID', 'Date & Time', 'Customer Mobile', 'Items', 'Subtotal', 'Tax', 'Total', 'Actions'] as header}
                  <th class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">{header}</th>
                {/each}
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              {#each filteredSales as sale (sale.id)}
                <tr 
                  class="table-row hover:bg-neutral-50/50 transition-colors duration-150"
                  in:slide={{ axis: 'y', duration: 200 }}
                  out:fade={{ duration: 150 }}
                >
                  <td class="px-4 md:px-6 py-4 font-mono text-sm text-neutral-500">{sale.id}</td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="font-medium text-black text-sm">{sale.date}</div>
                    <div class="text-xs text-neutral-500 mt-0.5">{sale.time}</div>
                  </td>
                  <td class="px-4 md:px-6 py-4 text-sm text-neutral-400">{sale.mobile}</td>
                  <td class="px-4 md:px-6 py-4 text-right text-sm text-neutral-600">{sale.items}</td>
                  <td class="px-4 md:px-6 py-4 text-right text-sm text-neutral-600">{formatCurrency(sale.subtotal)}</td>
                  <td class="px-4 md:px-6 py-4 text-right text-sm text-neutral-600">{formatCurrency(sale.tax)}</td>
                  <td class="px-4 md:px-6 py-4 text-right text-sm font-bold text-black">{formatCurrency(sale.total)}</td>
                  <td class="px-4 md:px-6 py-4">
                    <div class="flex items-center justify-end">
                      <button 
                        onclick={() => openModal(sale)}
                        class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-all duration-150 focus:ring-2 focus:ring-neutral-400 focus:outline-none active:scale-95" 
                        title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td colspan="8" class="px-6 py-12 text-center">
                    <div in:fade={{ duration: 300 }} class="flex flex-col items-center gap-3 text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="opacity-50">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                      <p class="font-medium">No transactions found</p>
                      <p class="text-sm">Try adjusting your filters or search criteria</p>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  {#if selectedInvoice}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 150 }}
      onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div 
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        in:fly={{ y: 30, duration: 250, easing: cubicOut }}
        out:fly={{ y: 20, duration: 150 }}
      >
        <div class="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h2 class="text-xl font-bold text-black">Invoice Details</h2>
            <p class="text-xs text-neutral-500 mt-1 font-mono">{selectedInvoice.id}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick={printInvoice} class="p-2 text-neutral-500 hover:text-black hover:bg-neutral-200 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-400 active:scale-95" title="Print">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </button>
            <button onclick={closeModal} class="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto print:p-0">
          <div class="flex justify-between items-start mb-8">
            <div>
              <p class="text-sm text-neutral-500 mb-1">Billed To</p>
              <p class="font-medium text-black">Walk-in Customer</p>
              <p class="text-sm text-neutral-400">Mobile: {selectedInvoice.mobile}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-neutral-500 mb-1">Date & Time</p>
              <p class="font-medium text-black">{selectedInvoice.date}</p>
              <p class="text-sm text-neutral-400">{selectedInvoice.time}</p>
            </div>
          </div>

          <div class="border border-neutral-200 rounded-xl overflow-hidden mb-6">
            <table class="w-full">
              <thead class="bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-500 uppercase">
                <tr>
                  <th class="text-left px-4 py-3 font-medium">Description</th>
                  <th class="text-center px-4 py-3 font-medium">Qty</th>
                  <th class="text-right px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 text-sm">
                <tr>
                  <td class="px-4 py-4 text-black font-medium">Retail Item(s)</td>
                  <td class="px-4 py-4 text-center text-neutral-600">{selectedInvoice.items}</td>
                  <td class="px-4 py-4 text-right text-neutral-600">{formatCurrency(selectedInvoice.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 pt-4 border-t border-neutral-100">
            <div class="flex justify-between text-sm">
              <span class="text-neutral-500">Subtotal</span>
              <span class="font-medium text-neutral-700">{formatCurrency(selectedInvoice.subtotal)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-500">Tax</span>
              <span class="font-medium text-neutral-700">{formatCurrency(selectedInvoice.tax)}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-neutral-100 mt-2">
              <span class="font-semibold text-black">Total Amount</span>
              <span class="text-xl font-bold text-black">{formatCurrency(selectedInvoice.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</Layout>

<style>
  @media print {
    :global(body *) { visibility: hidden; }
    .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
    .fixed.inset-0 { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white !important; }
    .fixed.inset-0 button { display: none !important; }
    .shadow-2xl { box-shadow: none !important; }
  }
  .overflow-y-auto { scroll-behavior: smooth; }
</style>