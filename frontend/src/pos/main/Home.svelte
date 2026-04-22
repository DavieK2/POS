<script lang="ts">
  import { onMount } from "svelte";
  import { BASE_URL } from "../../utils";
  import type { Category, DropDownOptions, PrinterData } from "../../shared/types";

  // Components
  import BarcodePanel from "../components/BarcodePanel.svelte";
  import CatalogPanel from "../components/CatalogPanel.svelte";
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

  // Utils & types
  import type { Order, PastOrder, PaymentMethod, ActiveOrderItem } from "./types";
  import { fmt, orderSubtotal, orderTotal } from "./utils";

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

  onMount(async () => {
    await getCategories();
  });

  // ─── Remote data ─────────────────────────────────────────────────────────────
  let categories = $state<Category[]>([]);

  async function getCategories(): Promise<void> {
    const res = await fetch(`${BASE_URL}/categories`);
    categories = await res.json();
  }

  // ─── Orders state ────────────────────────────────────────────────────────────
  let nextNum = $state<number>(8824);

  let orders = $state<Order[]>([]);

  let pastOrders = $state<PastOrder[]>([]);

  let activeOrder = $state<Order | null>(null);

  // ─── Derived order state ──────────────────────────────────────────────────────
  let hasActiveOrder = $derived(!!activeOrder);
  let tabOrders = $derived(orders.filter((o) => o.status === "held" || o.status === "active"));
  let subtotal = $derived<number>(activeOrder ? orderSubtotal(activeOrder) : 0);
  let total = $derived<number>(activeOrder ? orderTotal(activeOrder) : 0);
  let isEmpty = $derived<boolean>(!activeOrder || activeOrder.items.length === 0);
  let isLocked = $derived<boolean>(activeOrder?.status === "active");
  let isHeld = $derived<boolean>(activeOrder?.status === "held");
  let totalItems = $derived<number>(activeOrder?.items.length ?? 0);

  // ─── Toast ───────────────────────────────────────────────────────────────────
  let toast = $state<string>("");
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function showToast(msg: string): void {
    toast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast = "";
      toastTimer = null;
    }, 3000);
  }

  // ─── Order actions ────────────────────────────────────────────────────────────

  function selectOrder(order: Order): void {
    if (isLocked) {
      showToast("Please hold the current order before switching.");
      return;
    }
    const found = orders.find((o) => o.id === order.id);
    if (!found) return;
    activeOrder = found;
    if (activeOrder.status === "held") {
      activeOrder.status = "active";
    }
  }

  function newOrder(): void {
    console.log($state.snapshot(orders));

    if (isLocked) {
      showToast("Please hold the current order before creating a new one.");
      return;
    }
    if (isEmpty && activeOrder) return;

    const order: Order = {
      id: String(nextNum++),
      status: "active",
      items: [],
      currentSelectedItem: null,
      note: "",
      discount: 0,
    };

    orders.push(order);
    activeOrder = orders[orders.length - 1];
  }

  const addItemToOrder = (p: ActiveOrderItem): void => {
    if (!activeOrder) return;

    if (isHeld) {
      showToast("Resume the order before adding items.");
      return;
    }

    const existing = activeOrder.items.find((item) => item.id === p.id);

    if (existing) {
      existing.qty += 1;
      activeOrder.currentSelectedItem = existing;
    } else {
      const newItem = { ...p, qty: 1 };
      activeOrder.items.push(newItem);
      activeOrder.currentSelectedItem = activeOrder.items[activeOrder.items.length - 1];
    }
  };

  function removeItem(product: ActiveOrderItem): void {
    if (!activeOrder || isHeld) return;
    activeOrder.items = activeOrder.items.filter((item) => item.id !== product.id);
    activeOrder.currentSelectedItem = activeOrder.items[0] ?? null;
  }

  function incQty(product: ActiveOrderItem): void {
    if (!activeOrder || isHeld) return;
    const existing = activeOrder.items.find((item) => item.id === product.id);
    if (existing) existing.qty += 1;
  }

  function decQty(product: ActiveOrderItem): void {
    if (!activeOrder || isHeld) return;
    const existing = activeOrder.items.find((item) => item.id === product.id);
    if (!existing || existing.qty === 1) return;
    existing.qty -= 1;
  }

  function holdOrder(): void {
    if (!activeOrder) return;
    activeOrder.status = activeOrder.status === "held" ? "active" : "held";
  }

  function openNumpad(product: ActiveOrderItem): void {
    if (!activeOrder || isHeld) return;
    activeOrder.currentSelectedItem = product;
  }

  const updateItemQty = (product: ActiveOrderItem, qty: number): void => {
    if (!activeOrder || isHeld) return;
    const existing = activeOrder.items.find((item) => item.id === product.id);
    if (existing) existing.qty = qty;
  };

  // ─── Modal state ─────────────────────────────────────────────────────────────
  let showCancelModal = $state<boolean>(false);
  let showNoteModal = $state<boolean>(false);
  let showDiscountModal = $state<boolean>(false);
  let showHistoryModal = $state<boolean>(false);
  let showPayModal = $state<boolean>(false);
  let showPayConfirm = $state<boolean>(false);
  let showSettingsModal = $state<boolean>(false);

  let anyModalOpen = $derived<boolean>(showPayModal || showPayConfirm || showCancelModal || showNoteModal || showDiscountModal || showHistoryModal || showSettingsModal);

  // Note modal
  let draftNote = $state<string>("");
  function openNote(): void {
    if (activeOrder && !isHeld) {
      draftNote = activeOrder.note ?? "";
      showNoteModal = true;
    }
  }
  function saveNote(): void {
    if (activeOrder) activeOrder.note = draftNote;
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
    if (activeOrder) {
      const parsed = parseInt(String(draftDiscount).replace(/[^0-9]/g, ""));
      activeOrder.discount = isNaN(parsed) ? 0 : Math.min(parsed, subtotal);
    }
    showDiscountModal = false;
  }

  // Cancel modal
  function openCancel(): void {
    if (activeOrder && !isHeld) showCancelModal = true;
  }
  function confirmCancel(): void {
    if (!activeOrder) return;

    const currentOrder = orders.find((o) => o.id === activeOrder!.id);
    if (!currentOrder) return;

    currentOrder.status = "cancelled";
    activeOrder = null;

    showCancelModal = false;
  }

  // Pay modals
  let payMethod = $state<PaymentMethod>("cash");

  function openPay(): void {
    if (activeOrder && !isEmpty && !isHeld) {
      showPayModal = true;
      payMethod = "cash";
    }
  }

  function openPayConfirm(): void {
    showPayModal = false;
    showPayConfirm = true;
  }

  function selectPaymentMethod(method: PaymentMethod) {
    if (!activeOrder) return;

    const currentOrder = orders.find((o) => o.id === activeOrder!.id);
    if (!currentOrder) return;

    currentOrder.paymentMethod = method;
    payMethod = method;
  }

  function processPayment(): void {
    if (!activeOrder) return;
    const currentOrder = orders.find((o) => o.id === activeOrder!.id);
    if (!currentOrder) return;
    currentOrder.status = "paid";
    activeOrder = null;
    showPayConfirm = false;
  }

  function confirmPayAndPrint(): void {
    processPayment();
    showToast("Printing receipt…");
  }

  function openSettings(): void {
    showSettingsModal = true;
  }

  function saveSettings(message: string): void {
    showSettingsModal = false;
    showToast(message);
  }
  let searchMode = $state<"catalog" | "barcode">("barcode");

  $effect(() => {
    if( ! activeOrder ){
        searchMode = "barcode"
    }
  })
</script>

<AppToast message={toast} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="flex flex-col h-screen overflow-hidden main-font bg-zinc-300/40 text-[#0A0A0A] antialiased select-none"
  onkeydown={(e) => {
    if (e.key === "Escape") {
    }
  }}
  oncontextmenu={(e) => e.preventDefault()}
  role="application"
  aria-label="Vine POS"
>
  <div inert={anyModalOpen || undefined}>
    <AppHeader {dateString} {timeString} onOpenSettings={openSettings} />
  </div>

  <main class="flex flex-1 overflow-hidden min-h-0" inert={anyModalOpen || undefined}>
    <section class="flex-1 flex flex-col p-3.5 gap-2.5 overflow-hidden min-h-0">
      <OrderTabs {activeOrder} orders={tabOrders} {isLocked} {isEmpty} onSelectOrder={selectOrder} onNewOrder={newOrder} onShowHistory={() => (showHistoryModal = true)} />

      {#if isHeld}
        <HoldBanner />
      {/if}

      <FeaturedItemCard currentSelectedItem={activeOrder?.currentSelectedItem} {isHeld} onDecQty={decQty} onIncQty={incQty} updateQty={updateItemQty} onRemoveItem={removeItem} onOpenNumpad={openNumpad} />

      <OrderActionButtons {isEmpty} {isHeld} {activeOrder} onOpenNote={openNote} onHoldOrder={holdOrder} onOpenDiscount={openDiscount} onOpenCancel={openCancel} />

      <OrderItemsTable
        {activeOrder}
        onSelectProduct={(id) => {
          if (activeOrder) activeOrder.currentSelectedItem = id;
        }}
      />

      <OrderSummaryBar {isEmpty} {isHeld} {totalItems} {subtotal} {total} {activeOrder} onOpenPay={openPay} />
    </section>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <aside class="w-95 bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-hidden" onclick={(e) => e.stopPropagation()}>
      <div class="shrink-0 p-3 pb-3 border-b border-zinc-100">
        <div class="flex bg-zinc-100 p-0.75 rounded-[10px] gap-0.75 items-center {!hasActiveOrder || isHeld ? 'opacity-40 cursor-not-allowed' : ''}">
          <button
            onclick={() => {
              if (!hasActiveOrder || isHeld) return;
              searchMode = "barcode";
            }}
            disabled={!hasActiveOrder || isHeld}
            class="flex-1 flex items-center justify-center gap-1.75 py-1.75 rounded-lg text-sm font-medium transition-all
    {searchMode === 'barcode' ? 'bg-white shadow-sm text-[#0A0A0A] border border-zinc-200 cursor-pointer' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 cursor-pointer'}"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16M3 12H3.01M7.5 12H7.51M16.5 12H16.51M12 12H12.01M21 12H21.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Barcode
          </button>

          <button
            onclick={() => {
              if (!hasActiveOrder || isHeld) return;
              searchMode = "catalog";
            }}
            disabled={!hasActiveOrder || isHeld}
            class="flex-1 flex items-center justify-center gap-1.75 py-1.75 rounded-lg text-sm font-medium transition-all
    {searchMode === 'catalog' ? 'bg-white shadow-sm text-[#0A0A0A] border border-zinc-200 cursor-pointer' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 cursor-pointer'}"
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
        <BarcodePanel {isHeld} {addItemToOrder} {hasActiveOrder} {showToast} />
      {:else}
        <CatalogPanel {activeOrder} {addItemToOrder} {categories} {isHeld} />
      {/if}
    </aside>
  </main>
</div>

{#if showPayModal}
  <PayModal {activeOrder} {total} {payMethod} onPayMethodChange={selectPaymentMethod} onClose={() => (showPayModal = false)} onConfirm={openPayConfirm} />
{/if}

{#if showPayConfirm}
  <PayConfirmModal
    {activeOrder}
    {total}
    {payMethod}
    onConfirmAndPrint={confirmPayAndPrint}
    onConfirm={processPayment}
    onClose={() => {
      showPayConfirm = false;
      showPayModal = true;
    }}
  />
{/if}

{#if showCancelModal && activeOrder}
  <CancelModal {activeOrder} onConfirm={confirmCancel} onClose={() => (showCancelModal = false)} />
{/if}

{#if showNoteModal && activeOrder}
  <NoteModal bind:draftNote onSave={saveNote} onClose={() => (showNoteModal = false)} />
{/if}

{#if showDiscountModal && activeOrder}
  <DiscountModal {subtotal} bind:draftDiscount onSave={saveDiscount} onClose={() => (showDiscountModal = false)} />
{/if}

{#if showHistoryModal}
  <HistoryModal {pastOrders} onClose={() => (showHistoryModal = false)} onPrintReceipt={(id) => showToast(`Printing receipt for Order #${id}…`)} />
{/if}

{#if showSettingsModal}
  <SettingsModal {showToast} onSave={saveSettings} onClose={() => (showSettingsModal = false)} />
{/if}

<style>
  [inert] {
    pointer-events: none;
    user-select: none;
    opacity: 0.4;
    transition: opacity 0.15s ease;
  }
</style>
