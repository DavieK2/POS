<script lang="ts">
  import { onMount } from "svelte";
  import { BASE_URL } from "../../utils";
  import type { Category } from "../../shared/types";

  // Components
  import BarcodePanel    from "../components/BarcodePanel.svelte";
  import CatalogPanel    from "../components/CatalogPanel.svelte";

  // Utils & types
  import type { Order, PastOrder, EnrichedItem, PaymentMethod, ActiveOrderItem, POSProduct } from "./types";
  import { catalog, fmt, orderItems, orderSub, orderTotal } from "./utils";
  import AppToast from "../components/AppToast.svelte";
  import AppHeader from "../components/AppHeader.svelte";
  import OrderTabs from "../components/OrderTabs.svelte";
  import HoldBanner from "../components/HoldBanner.svelte";
  import FeaturedItemCard from "../components/FeaturedItemCard.svelte";
  import OrderActionButtons from "../components/OrderActionButtons.svelte";
  import OrderItemsTable from "../components/OrderItemsTable.svelte";
  import OrderSummaryBar from "../components/OrderSummaryBar.svelte";
  import PayModal from "../modals/PayModal.svelte";
  import PayConfirmModal from "../modals/PayConfirmModal.svelte";
  import CancelModal from "../modals/CancelModal.svelte";
  import NoteModal from "../modals/NoteModal.svelte";
  import DiscountModal from "../modals/DiscountModal.svelte";
  import HistoryModal from "../modals/HistoryModal.svelte";
  import SettingsModal from "../modals/SettingsModal.svelte";

  // ─── Clock ───────────────────────────────────────────────────────────────────
  const initDate = new Date();
  let timeString = $state<string>(formatTime(initDate));
  let dateString = $state<string>(formatDate(initDate));

  function formatTime(d: Date): string {
    const h = d.getHours();
    return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  }
  function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  onMount(() => {
    const iv = setInterval(() => {
      const d = new Date();
      timeString = formatTime(d);
      dateString = formatDate(d);
    }, 1000);
    return () => clearInterval(iv);
  });

  onMount( async () => {
      await getCategories();
      await getProducts();
  });

  // ─── Remote data ─────────────────────────────────────────────────────────────
  let products   = $state<POSProduct[]>([]);
  let categories = $state<Category[]>([]);

  let activeOrderItems: ActiveOrderItem[] = $state([])
  let currentSelectedItem = $derived<ActiveOrderItem | null | undefined>(null);

  

  async function getProducts(): Promise<void> {
    const res = await fetch(`${BASE_URL}/products`);
    products   = await res.json();
  }
  async function getCategories(): Promise<void> {
    const res = await fetch(`${BASE_URL}/categories`);
    categories = await res.json();
  }

  // ─── Orders state ────────────────────────────────────────────────────────────
  let nextNum = $state<number>(8824);

  let orders = $state<Order[]>([
    {
      id: "8823", status: "active", discount: 2500, note: "",
      items: [
        { productId: 1, qty: 11 },
        { productId: 2, qty: 1  },
        { productId: 3, qty: 2  },
        { productId: 4, qty: 1  },
      ],
    },
    {
      id: "8822", status: "held", discount: 0, note: "Customer forgot wallet",
      items: [
        { productId: 5, qty: 2 },
        { productId: 7, qty: 3 },
        { productId: 8, qty: 1 },
      ],
    },
    {
      id: "8820", status: "held", discount: 5000, note: "",
      items: [
        { productId: 1,  qty: 5 },
        { productId: 3,  qty: 4 },
        { productId: 6,  qty: 6 },
        { productId: 9,  qty: 8 },
        { productId: 10, qty: 3 },
      ],
    },
  ]);

  let pastOrders = $state<PastOrder[]>([
    { id: "8821", date: "Today, 08:45 AM",        total: 12500, status: "paid",      method: "card",     items: [{ productId: 1, qty: 2 }, { productId: 2, qty: 1 }] },
    { id: "8819", date: "Today, 08:12 AM",        total: 4200,  status: "paid",      method: "cash",     items: [{ productId: 4, qty: 1 }] },
    { id: "8818", date: "Yesterday, 04:30 PM",    total: 18000, status: "paid",      method: "transfer", items: [{ productId: 7, qty: 2 }, { productId: 8, qty: 1 }] },
    { id: "8817", date: "Yesterday, 03:15 PM",    total: 0,     status: "cancelled", method: "-",        items: [] },
  ]);

  let activeOrderId    = $state<string | null>("8823");
  let selectedProductId = $state<number>(1);

  // ─── Derived order state ──────────────────────────────────────────────────────
  let activeOrder  = $derived<Order | null>(orders.find((o) => o.id === activeOrderId) ?? null);
  let activeItems  = $derived<EnrichedItem[]>(activeOrder ? orderItems(activeOrder) : []);
  let subtotal     = $derived<number>(activeOrder ? orderSub(activeOrder) : 0);
  let total        = $derived<number>(activeOrder ? orderTotal(activeOrder) : 0);
  let isEmpty      = $derived<boolean>(activeOrderItems.length === 0);
  let featuredEntry = $derived<EnrichedItem | null>(null);
  let isLocked = $derived<boolean>(activeOrder?.status === "active" && !isEmpty);
  let isHeld   = $derived<boolean>(activeOrder?.status === "held");

  // Keep selectedProductId in sync when items change
  $effect(() => {
    if (activeItems.length && !activeItems.find((i) => i.productId === selectedProductId)) {
      selectedProductId = activeItems[0].productId;
    }
  });

  // ─── Toast ───────────────────────────────────────────────────────────────────
  let toast      = $state<string>("");
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function showToast(msg: string): void {
    toast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast = ""; toastTimer = null; }, 3000);
  }

  // ─── Order actions ────────────────────────────────────────────────────────────
  function selectOrder(id: string): void {
    if (isLocked && id !== activeOrderId) {
      showToast("Please hold the current order before switching.");
      return;
    }
    activeOrderId = id;
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1 && orders[idx].status === "held") orders[idx].status = "active";
  }

  function newOrder(): void {
    if (isLocked) { showToast("Please hold the current order before creating a new one."); return; }
    if (isEmpty || activeOrderId === null) return;
    activeOrderId = null;
  }

  const addItemToOrder = ( p : ActiveOrderItem ) : void => {

      if (isHeld) { 
        showToast("Resume the order before adding items."); 
        return; 
      }

      const existingIndex = activeOrderItems.findIndex(item => item.id === p.id);

      if (existingIndex !== -1) {
          const updatedItem = { ...p, qty: activeOrderItems[existingIndex].qty + 1  }
          activeOrderItems[existingIndex] = updatedItem;
          currentSelectedItem = updatedItem;
      } 
      else {
          const newItem = { ...p, qty: 1 };
          activeOrderItems.push(newItem);
          currentSelectedItem = newItem;
      }


  }

  function removeItem(product: ActiveOrderItem ): void {
    if (isHeld) return;
    activeOrderItems = activeOrderItems.filter( item => item.id !== product.id )
    currentSelectedItem = activeOrderItems[0] || null
  }

  function mutateQty(productId: number, fn: (q: number) => number): void {
    if (isHeld) return;
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    if (idx === -1) return;
    const item = orders[idx].items.find((i) => i.productId === productId);
    if (item) item.qty = fn(item.qty);
  }

  function incQty(product: ActiveOrderItem): void { 
      if (isHeld) return; 
      const existing = activeOrderItems.find( item => item.id === product.id );
      if(! existing) return
      existing.qty += 1
  }

  function decQty(product: ActiveOrderItem): void { 
      if (isHeld) return; 
      const existing = activeOrderItems.find( item => item.id === product.id );
      if(! existing) return
      if( existing.qty === 1 ) return;
      existing.qty -= 1
  }

  function holdOrder(): void {
    if (!activeOrder || isEmpty) return;
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    orders[idx].status = orders[idx].status === "held" ? "active" : "held";
  }

  // ─── Numpad ──────────────────────────────────────────────────────────────────
  let numpadProductId = $state<number | null>(null);

  function openNumpad(product: ActiveOrderItem): void {
     if (isHeld) return;
     currentSelectedItem = product 
  }

  const updateItemQty = ( product: ActiveOrderItem, qty: number ) => {
      if (isHeld) return;
      const existing = activeOrderItems.find( item => item.id === product.id );
      if(! existing) return;
      existing.qty = qty
  }

 

  // ─── Modal state ─────────────────────────────────────────────────────────────
  let showCancelModal   = $state<boolean>(false);
  let showNoteModal     = $state<boolean>(false);
  let showDiscountModal = $state<boolean>(false);
  let showHistoryModal  = $state<boolean>(false);
  let showPayModal      = $state<boolean>(false);
  let showPayConfirm    = $state<boolean>(false);
  let showSettingsModal = $state<boolean>(false);

  let anyModalOpen = $derived<boolean>(
    showPayModal || showPayConfirm || showCancelModal ||
    showNoteModal || showDiscountModal || showHistoryModal || showSettingsModal
  );

  // Note modal
  let draftNote = $state<string>("");
  function openNote(): void {
    if (activeOrder && !isHeld) { draftNote = activeOrder.note ?? ""; showNoteModal = true; }
  }
  function saveNote(): void {
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    orders[idx].note = draftNote;
    showNoteModal = false;
  }

  // Discount modal
  let draftDiscount = $state<string>("");
  function openDiscount(): void {
    if (!activeOrder || isEmpty || isHeld) return;
    draftDiscount = activeOrder.discount ? String(activeOrder.discount) : "";
    showDiscountModal = true;
  }
  function saveDiscount(): void {
    const parsed = parseInt(String(draftDiscount).replace(/[^0-9]/g, ""));
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    orders[idx].discount = isNaN(parsed) ? 0 : Math.min(parsed, subtotal);
    showDiscountModal = false;
  }

  // Cancel modal
  function openCancel(): void { if (activeOrder && !isHeld) showCancelModal = true; }
  function confirmCancel(): void {
    pastOrders = [
      {
        id: activeOrderId!,
        date: new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }),
        total: 0, status: "cancelled", method: "-",
        items: [...(activeOrder?.items ?? [])],
      },
      ...pastOrders,
    ];
    orders = orders.filter((o) => o.id !== activeOrderId);
    activeOrderId  = null;
    showCancelModal = false;
  }

  // Pay modals
  let payMethod = $state<PaymentMethod>("cash");
  function openPay(): void {
    if (activeOrder && !isEmpty && !isHeld) { showPayModal = true; payMethod = "cash"; }
  }
  function openPayConfirm(): void { showPayModal = false; showPayConfirm = true; }

  function processPayment(): void {
    const id = activeOrderId!;
    pastOrders = [
      {
        id, total, status: "paid", method: payMethod,
        date: new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }),
        items: [...(activeOrder?.items ?? [])],
      },
      ...pastOrders,
    ];
    orders = orders.filter((o) => o.id !== id);
    activeOrderId  = null;
    showPayConfirm = false;
    showToast(`Order #${id} paid via ${payMethod.toUpperCase()} — ${fmt(total)}`);
    newOrder();
  }

  function confirmPayAndPrint(): void {
    const id = activeOrderId!;
    processPayment();
    showToast(`Printing receipt for Order #${id}…`);
  }

  // Settings
  let isDetectingPrinters = $state<boolean>(false);
  let printers            = $state<string[]>([]);
  let selectedPrinter     = $state<string>("");

  function openSettings(): void { showSettingsModal = true; detectPrinters(); }
  function detectPrinters(): void {
    isDetectingPrinters = true;
    printers = [];
    setTimeout(() => {
      printers = ["Epson TM-T88VI Receipt", "HP LaserJet Pro M404n", "Star TSP143III USB", "Microsoft Print to PDF"];
      selectedPrinter     = printers[0];
      isDetectingPrinters = false;
    }, 1200);
  }
  function saveSettings(): void {
    showSettingsModal = false;
    showToast(`Printer set to: ${selectedPrinter}`);
  }

  

  // Search / catalog panel
  let searchQuery     = $state<string>("");
  let searchMode      = $state<"catalog" | "barcode">("barcode");
  let selectedCategory = $state<string | null>(null);

  $effect(() => {
      currentSelectedItem = activeOrderItems.find( (item) => item.id === currentSelectedItem?.id )
  })
</script>

<!-- Toast -->
<AppToast message={toast} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="flex flex-col h-screen overflow-hidden main-font bg-zinc-100 text-[#0A0A0A] antialiased select-none"
  // onclick={closeNumpad}
  onkeydown={(e) => { if (e.key === "Escape") {} }}
  oncontextmenu={(e) => e.preventDefault()}
  role="application"
  aria-label="Vine POS"
>
  <!-- Header -->
  <div inert={anyModalOpen || undefined}>
    <AppHeader {dateString} {timeString} onOpenSettings={openSettings} />
  </div>

  <main class="flex flex-1 overflow-hidden min-h-0" inert={anyModalOpen || undefined}>

    <!-- ── Left panel: order workspace ── -->
    <section class="flex-1 flex flex-col p-3.5 gap-2.5 overflow-hidden min-h-0">

      <OrderTabs
        {orders}
        {activeOrderId}
        {isLocked}
        {isEmpty}
        onSelectOrder={selectOrder}
        onNewOrder={newOrder}
        onShowHistory={() => (showHistoryModal = true)}
      />

      {#if isHeld}
        <HoldBanner />
      {/if}

      <FeaturedItemCard
        {currentSelectedItem}
        {isHeld}
        onDecQty={decQty}
        onIncQty={incQty}
        updateQty={updateItemQty}
        onRemoveItem={removeItem}
        onOpenNumpad={openNumpad}
      />

      <OrderActionButtons
        {isEmpty}
        {isHeld}
        {activeOrder}
        onOpenNote={openNote}
        onHoldOrder={holdOrder}
        onOpenDiscount={openDiscount}
        onOpenCancel={openCancel}
      />

      <OrderItemsTable
        {isEmpty}
        activeItems={activeOrderItems}
        {currentSelectedItem}
        onSelectProduct={(id) => (currentSelectedItem = id)}
      />

      <OrderSummaryBar
        {isEmpty}
        {isHeld}
        {activeItems}
        {subtotal}
        {total}
        {activeOrder}
        onOpenPay={openPay}
      />
    </section>

    <!-- ── Right panel: catalog / barcode ── -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <aside
      class="w-95 bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="shrink-0 p-3 pb-3 border-b border-zinc-100">
        <div class="flex bg-zinc-100 p-0.75 rounded-[10px] gap-0.75 items-center">
          <button
            onclick={() => { searchMode = "barcode"; searchQuery = ""; selectedCategory = null; }}
            class="flex-1 flex items-center justify-center gap-1.75 py-1.75 rounded-lg cursor-pointer text-[13px] font-medium transition-all
                   {searchMode === 'barcode' ? 'bg-white shadow-sm text-[#0A0A0A] border border-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16M3 12H3.01M7.5 12H7.51M16.5 12H16.51M12 12H12.01M21 12H21.01"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Barcode
          </button>

          <button
            onclick={() => { searchMode = "catalog"; searchQuery = ""; }}
            class="flex-1 flex items-center cursor-pointer justify-center gap-1.75 py-1.75 rounded-lg text-[13px] font-medium transition-all
                   {searchMode === 'catalog' ? 'bg-white shadow-sm text-[#0A0A0A] border border-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Catalog
          </button>
        </div>
      </div>

      {#if searchMode === "barcode"}
        <BarcodePanel {isHeld} {addItemToOrder} />
      {:else}
        <CatalogPanel {addItemToOrder} {categories} />
      {/if}
    </aside>

  </main>
</div>

<!-- ── Modals ── -->
{#if showPayModal}
  <PayModal
    {activeOrderId}
    {activeOrder}
    {activeItems}
    {total}
    {payMethod}
    onPayMethodChange={(m) => (payMethod = m)}
    onClose={() => (showPayModal = false)}
    onConfirm={openPayConfirm}
  />
{/if}

{#if showPayConfirm}
  <PayConfirmModal
    {activeOrderId}
    {total}
    {payMethod}
    onConfirmAndPrint={confirmPayAndPrint}
    onConfirm={processPayment}
    onClose={() => { showPayConfirm = false; showPayModal = true; }}
  />
{/if}

{#if showCancelModal}
  <CancelModal
    {activeOrderId}
    onConfirm={confirmCancel}
    onClose={() => (showCancelModal = false)}
  />
{/if}

{#if showNoteModal}
  <NoteModal
    bind:draftNote
    onSave={saveNote}
    onClose={() => (showNoteModal = false)}
  />
{/if}

{#if showDiscountModal}
  <DiscountModal
    {subtotal}
    bind:draftDiscount
    onSave={saveDiscount}
    onClose={() => (showDiscountModal = false)}
  />
{/if}

{#if showHistoryModal}
  <HistoryModal
    {pastOrders}
    onClose={() => (showHistoryModal = false)}
    onPrintReceipt={(id) => showToast(`Printing receipt for Order #${id}…`)}
  />
{/if}

{#if showSettingsModal}
  <SettingsModal
    {isDetectingPrinters}
    {printers}
    bind:selectedPrinter
    onRefresh={detectPrinters}
    onSave={saveSettings}
    onClose={() => (showSettingsModal = false)}
  />
{/if}

<style>
  [inert] {
    pointer-events: none;
    user-select: none;
    opacity: 0.4;
    transition: opacity 0.15s ease;
  }
</style>