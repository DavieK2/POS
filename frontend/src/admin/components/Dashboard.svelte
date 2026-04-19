<script lang="ts">
  import Icon from "../../lib/Icon.svelte";
  import Layout from "../layouts/Layout.svelte";

  const stats = $state([
    {
      id: 'today-revenue',
      title: "Today's Revenue",
      value: '₹0.00',
      footer: '0 transactions',
      icon: 'dollar-sign',
      badge: 'Today'
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: '₹0.00',
      footer: '0 total sales',
      icon: 'trending-up'
    },
    {
      id: 'products',
      title: 'Total Products',
      value: '15',
      footer: '456 items in stock',
      icon: 'package'
    },
    {
      id: 'users',
      title: 'Total Users',
      value: '0',
      footer: 'Registered with mobile',
      icon: 'users'
    }
  ]);
</script>

<Layout>

    <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p class="text-neutral-500">Welcome back! Here's what's happening today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {#each stats as stat}
          <div 
            class="
              bg-white p-5 md:p-6 rounded-xl border border-neutral-200 
              transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg
            "
          >
            <div class="flex items-center justify-between mb-4">
              <div class="w-11 h-11 md:w-12 md:h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
              
                <Icon name={stat.icon} class="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
              </div>
              {#if stat.badge}
                <span class="text-xs font-medium px-2 py-1 bg-neutral-100 rounded-full text-neutral-700">
                  {stat.badge}
                </span>
              {/if}
            </div>
            <div class="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
            <div class="text-sm text-neutral-500">{stat.title}</div>
            {#if stat.footer}
              <div class="text-xs text-neutral-400 mt-1">{stat.footer}</div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Alert Banner -->
      <div class="bg-neutral-100 border border-neutral-300 rounded-xl p-4 mb-6 md:mb-8">
        <div class="flex items-start gap-3">
          <Icon name="alert-circle" class="w-5 h-5 text-neutral-700 mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-neutral-900 mb-1">Low Stock Alert</div>
            <div class="text-sm text-neutral-600">4 product(s) are running low on stock</div>
          </div>
          <button 
            class="text-xs font-medium px-3 py-1.5 bg-white border border-neutral-300 rounded-lg 
                   hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            View Details
          </button>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <!-- Recent Sales -->
        <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div class="p-4 md:p-6 border-b border-neutral-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recent Sales</h2>
            <button class="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              View All
            </button>
          </div>
          <div class="p-6">
            <div class="text-center text-neutral-500 py-8">
              <Icon name="alert-circle" class="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p class="font-medium">No sales yet</p>
              <p class="text-sm mt-1">Start selling to see your recent transactions here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Spacer -->
      <div class="h-8 md:h-12"></div>
    </div>


</Layout>

