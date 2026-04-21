<!-- Dashboard.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '../../lib/Icon.svelte';
  import { goto } from '@mateothegreat/svelte5-router';
  import { toastMessage } from '../../lib/toast';


  let { children }  = $props();
  // Svelte 5 Runes
  let sidebarOpen = $state(false);
  let activeNav = $state('dashboard');
  let isMobile = $state(false);

  let isMobileView = $derived<boolean>(isMobile);

  const navItems = $state([
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', url: '/dashboard' },
    { id: 'inventory', label: 'Inventory', icon: 'package', url: '/inventory' },
    { id: 'sales', label: 'Sales History', icon: 'receipt', url: '/sales' },
    { id: 'users', label: 'Users', icon: 'users', url: '/users' },
    { id: 'settings', label: 'Settings', icon: 'settings', url: '/settings' }
  ]);

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) sidebarOpen = false;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };

  const handleNavClick = (id: string, url: string) => {
    activeNav = id;
    if (isMobile) sidebarOpen = false;
    goto(url);
  };
</script>

{#if isMobile && sidebarOpen}
  <button 
    class="fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden"
    onclick={toggleSidebar}
    aria-hidden="true"
  ></button>
{/if}

{#if $toastMessage}
  <div class="toast-container">
    <div class="toast-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
      {$toastMessage}
    </div>
  </div>
{/if}

<div class="main-font flex min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
  <aside 
    class="
      fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white 
      flex flex-col transform transition-transform duration-300 ease-in-out
      {sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
    "
    aria-label="Main navigation"
  >
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
  
  :global(button:focus-visible),
  :global([role="button"]:focus-visible) {
    outline: 2px solid #000;
    outline-offset: 2px;
  }
  
  aside {
    will-change: transform;
  }

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

  .toast-container {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 9999;
  }
  .toast-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0a0a0a;
    color: white;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 9999px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    animation: toastIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>