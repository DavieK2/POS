<!-- Dashboard.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '../../lib/Icon.svelte';
  import { goto } from '@mateothegreat/svelte5-router';


  let { children }  = $props();
  // Svelte 5 Runes
  let sidebarOpen = $state(false);
  let activeNav = $state('dashboard');
  let isMobile = $state(false);

  // Derived values
  let isMobileView = $derived<boolean>(isMobile);

  // Navigation items
  const navItems = $state([
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', url: '/dashboard' },
    { id: 'inventory', label: 'Inventory', icon: 'package', url: '/inventory' },
    { id: 'sales', label: 'Sales History', icon: 'receipt', url: '/sales' },
    { id: 'users', label: 'Users', icon: 'users', url: '/users' },
    { id: 'settings', label: 'Settings', icon: 'settings', url: '/settings' }
  ]);

  // Handle viewport resize
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) sidebarOpen = false;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };

  // Close sidebar on mobile when nav item clicked
  const handleNavClick = (id: string, url: string) => {
    activeNav = id;
    if (isMobile) sidebarOpen = false;
    goto(url);
  };
</script>

<!-- Overlay for mobile sidebar -->
{#if isMobile && sidebarOpen}
  <button 
    class="fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden"
    onclick={toggleSidebar}
    aria-hidden="true"
  ></button>
{/if}

<div class="flex min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
  <!-- Sidebar - FIXED & SCROLLABLE -->
  <aside 
    class="
      fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white 
      flex flex-col transform transition-transform duration-300 ease-in-out
      {sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
    "
    aria-label="Main navigation"
  >
    <!-- Logo - Fixed at top -->
    <div class="p-5 border-b border-neutral-700 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <Icon name='store' class='w-5 h-5 text-neutral-900' />
        </div>
        <div>
          <div class="font-bold text-lg tracking-tight">Retail POS</div>
          <div class="text-xs text-neutral-400">Cloth Store</div>
        </div>
      </div>
    </div>

    <!-- Navigation - Scrollable area -->
    <nav class="flex-1 p-3 overflow-y-auto overflow-x-hidden">
      <div class="space-y-1">
        {#each navItems as item}
          <button
            class="
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              {window.location.pathname === item.url  
                ? 'bg-neutral-800 text-white border-l-2 border-white' 
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-l-2 border-transparent'}
            "
            onclick={() => handleNavClick(item.id, item.url)}
            aria-current={window.location.pathname === item.url  ? 'page' : undefined}
          >
            <Icon name={item.icon} class='w-5 h-5 shrink-0' />
            <span class="font-medium truncate">{item.label}</span>
          </button>
        {/each}
      </div>
    </nav>

    <!-- Footer - Fixed at bottom -->
    <div class="p-4 border-t border-neutral-700 shrink-0">
      <div class="text-xs text-neutral-400 text-center">Version 1.0.0</div>
    </div>
  </aside>

  <main class="flex-1 ml-0 md:ml-64 overflow-auto min-h-screen">
      <header class="md:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <button onclick={toggleSidebar} class="p-2 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Toggle navigation menu" aria-expanded={sidebarOpen}>
          <Icon name="menu" class="w-6 h-6" />
        </button>
        <h1 class="font-bold text-lg">Dashboard</h1>
        <div class="w-6"></div>
      </header>
    {@render children?.()}
  </main>
</div>

<!-- Global styles for scrollbar and transitions -->
<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  
  :global(::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #fafafa;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #d4d4d4;
    border-radius: 3px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #a3a3a3;
  }
  
  /* Focus styles for accessibility */
  :global(button:focus-visible),
  :global([role="button"]:focus-visible) {
    outline: 2px solid #000;
    outline-offset: 2px;
  }
  
  /* Smooth sidebar transition */
  aside {
    will-change: transform;
  }

  /* Hide scrollbar for Chrome/Safari/Opera but keep functionality */
  .overflow-y-auto::-webkit-scrollbar {
    width: 4px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #525252;
    border-radius: 2px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #737373;
  }
</style>