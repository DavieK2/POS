<script lang="ts">
  import { onMount } from "svelte";
  import { BASE_URL } from "../../utils";
  import type { POSProduct } from "./types";
  import type { Category } from "../../shared/types";
  import BarcodePanel from "../components/BarcodePanel.svelte";
  import CatalogPanel from "../components/CatalogPanel.svelte";
  type OrderStatus = "active" | "held";
  type PaymentMethod = "cash" | "card" | "transfer";
  type PastOrderStatus = "paid" | "cancelled";
  
  interface Product {
    id: number;
    barcode: string;
    name: string;
    category: string;
    unit: string;
    price: number;
    img: string;
  }

  interface OrderItem {
    productId: number;
    qty: number;
  }
  interface Order {
    id: string;
    status: OrderStatus;
    discount: number;
    note: string;
    items: OrderItem[];
  }
  interface PastOrder {
    id: string;
    date: string;
    total: number;
    status: PastOrderStatus;
    method: PaymentMethod | "-";
    items: OrderItem[];
  }
  interface EnrichedItem extends OrderItem {
    product: Product;
  }
  interface PaymentOption {
    id: PaymentMethod;
    label: string;
    icon: string;
  }

  const initDate = new Date();
  let timeString = $state<string>(`${initDate.getHours() % 12 || 12}:${String(initDate.getMinutes()).padStart(2, "0")} ${initDate.getHours() >= 12 ? "PM" : "AM"}`);
  let dateString = $state<string>(initDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
  onMount(() => {
      const tick = (): void => {
        const d = new Date();
        const h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, "0");
        timeString = `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
        dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      };

      const iv = setInterval(tick, 1000);
      return () => clearInterval(iv);
  });

  onMount( async () => {
      await getCategories();
      await getProducts();
  });

  let products : POSProduct[] = $state([])
  let categories : Category[] = $state([])

  const getProducts = async() => {
      const req = await fetch(`${BASE_URL}/products`);
      const res = await req.json();
      products = res;
  }

  const getCategories = async() => {
      const req = await fetch(`${BASE_URL}/categories`);
      const res = await req.json();
      categories = res;    
  }


  const catalog: Product[] = [
    { id: 1, barcode: "000001", name: "Organic Hass Avocado", category: "Produce", unit: "each", price: 3200, img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=200" },
    { id: 2, barcode: "000002", name: "Organic Valley Mozzarella", category: "Dairy", unit: "450 g", price: 7500, img: "https://images.unsplash.com/photo-1628815870980-f416105d89b3?auto=format&fit=crop&q=80&w=200" },
    { id: 3, barcode: "000003", name: "Garden Fresh Strawberries", category: "Produce", unit: "500 g", price: 3800, img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=200" },
    { id: 4, barcode: "000004", name: "Whole Organic Milk", category: "Dairy", unit: "2 L", price: 4200, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200" },
    { id: 5, barcode: "000005", name: "Sourdough Bread", category: "Bakery", unit: "loaf", price: 2800, img: "https://images.unsplash.com/photo-1585478259715-4ddc5572f0e7?auto=format&fit=crop&q=80&w=200" },
    { id: 6, barcode: "000006", name: "Free Range Eggs", category: "Dairy", unit: "12 pk", price: 2500, img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=200" },
    { id: 7, barcode: "000007", name: "Cold Brew Coffee", category: "Beverages", unit: "500 ml", price: 5500, img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=200" },
    { id: 8, barcode: "000008", name: "Granola Bar Pack", category: "Snacks", unit: "6 bars", price: 3600, img: "https://images.unsplash.com/photo-1490567674331-8a29f0cbfe5a?auto=format&fit=crop&q=80&w=200" },
    { id: 9, barcode: "000009", name: "Cherry Tomatoes", category: "Produce", unit: "250 g", price: 1800, img: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&q=80&w=200" },
    { id: 10, barcode: "000010", name: "Greek Yogurt", category: "Dairy", unit: "400 g", price: 3900, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=200" },
    { id: 11, barcode: "000011", name: "Sparkling Water", category: "Beverages", unit: "1 L", price: 1200, img: "https://images.unsplash.com/photo-1606168094336-48f205bfc3b4?auto=format&fit=crop&q=80&w=200" },
    { id: 12, barcode: "000012", name: "Dark Chocolate Bar", category: "Snacks", unit: "100 g", price: 2200, img: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=200" },
  ];
  const categoryMeta: Record<string, { emoji: string; color: string; bg: string; border: string; hex: string }> = {
    Produce: { emoji: "🥬", color: "text-green-700", bg: "bg-green-50", border: "border-green-300", hex: "#16a34a" },
    Dairy: { emoji: "🥛", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", hex: "#2563eb" },
    Bakery: { emoji: "🍞", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", hex: "#d97706" },
    Beverages: { emoji: "🥤", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", hex: "#9333ea" },
    Snacks: { emoji: "🍫", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-300", hex: "#e11d48" },
  };
  const categoriesOld = [...new Set(catalog.map((p) => p.category))];

  let nextNum = $state<number>(8824);
  let orders = $state<Order[]>([
    {
      id: "8823",
      status: "active",
      discount: 2500,
      note: "",
      items: [
        { productId: 1, qty: 11 },
        { productId: 2, qty: 1 },
        { productId: 3, qty: 2 },
        { productId: 4, qty: 1 },
      ],
    },
    {
      id: "8822",
      status: "held",
      discount: 0,
      note: "Customer forgot wallet",
      items: [
        { productId: 5, qty: 2 },
        { productId: 7, qty: 3 },
        { productId: 8, qty: 1 },
      ],
    },
    {
      id: "8820",
      status: "held",
      discount: 5000,
      note: "",
      items: [
        { productId: 1, qty: 5 },
        { productId: 3, qty: 4 },
        { productId: 6, qty: 6 },
        { productId: 9, qty: 8 },
        { productId: 10, qty: 3 },
      ],
    },
  ]);
  let pastOrders = $state<PastOrder[]>([
    {
      id: "8821",
      date: "Today, 08:45 AM",
      total: 12500,
      status: "paid",
      method: "card",
      items: [
        { productId: 1, qty: 2 },
        { productId: 2, qty: 1 },
      ],
    },
    { id: "8819", date: "Today, 08:12 AM", total: 4200, status: "paid", method: "cash", items: [{ productId: 4, qty: 1 }] },
    {
      id: "8818",
      date: "Yesterday, 04:30 PM",
      total: 18000,
      status: "paid",
      method: "transfer",
      items: [
        { productId: 7, qty: 2 },
        { productId: 8, qty: 1 },
      ],
    },
    { id: "8817", date: "Yesterday, 03:15 PM", total: 0, status: "cancelled", method: "-", items: [] },
  ]);
  let activeOrderId = $state<string | null>("8823");
  let selectedProductId = $state<number>(1);

  const getProduct = (id: number): Product | undefined => catalog.find((p) => p.id === id);
  const orderItems = (o: Order): EnrichedItem[] => o.items.map((i) => ({ ...i, product: getProduct(i.productId)! })).filter((i) => i.product != null);
  const orderSub = (o: Order): number => orderItems(o).reduce((s, i) => s + i.product.price * i.qty, 0);
  const orderTotal = (o: Order): number => Math.max(0, orderSub(o) - (o.discount ?? 0));
  const fmt = (n: number): string => "₦" + Number(n).toLocaleString("en-NG");

  let activeOrder = $derived<Order | null>(orders.find((o) => o.id === activeOrderId) ?? null);
  let activeItems = $derived<EnrichedItem[]>(activeOrder ? orderItems(activeOrder) : []);
  let subtotal = $derived<number>(activeOrder ? orderSub(activeOrder) : 0);
  let total = $derived<number>(activeOrder ? orderTotal(activeOrder) : 0);
  let isEmpty = $derived<boolean>(activeItems.length === 0);
  let featuredEntry = $derived<EnrichedItem | null>(activeItems.find((i) => i.productId === selectedProductId) ?? activeItems[0] ?? null);
  let isLocked = $derived<boolean>(activeOrder?.status === "active" && !isEmpty);
  let isHeld = $derived<boolean>(activeOrder?.status === "held");

  let showSettingsModal = $state<boolean>(false);
  let isDetectingPrinters = $state<boolean>(false);
  let printers = $state<string[]>([]);
  let selectedPrinter = $state<string>("");

  $effect(() => {
    if (activeItems.length && !activeItems.find((i) => i.productId === selectedProductId)) {
      selectedProductId = activeItems[0].productId;
    }
  });

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
    if (isLocked) {
      showToast("Please hold the current order before creating a new one.");
      return;
    }
    if (isEmpty || activeOrderId === null) return;
    activeOrderId = null;
  }

  function addItem(productId: number): void {
    if (isHeld) {
      showToast("Resume the order before adding items.");
      return;
    }
    if (activeOrderId === null) {
      const id = String(nextNum++);
      orders.push({ id, status: "active", discount: 0, note: "", items: [] });
      activeOrderId = id;
    }
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    const existing = orders[idx].items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty = Math.max(1, existing.qty + 1);
    } else {
      orders[idx].items.push({ productId, qty: 1 });
    }
    selectedProductId = productId;
  }

  function removeItem(productId: number): void {
    if (isHeld) return;
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    if (idx === -1) return;
    orders[idx].items = orders[idx].items.filter((i) => i.productId !== productId);
    if (orders[idx].items.length === 0) {
      orders.splice(idx, 1);
      activeOrderId = null;
    }
  }

  function incQty(productId: number): void {
    if (!isHeld) mutateQty(productId, (q) => q + 1);
  }
  function decQty(productId: number): void {
    if (!isHeld) mutateQty(productId, (q) => Math.max(1, q - 1));
  }

  function mutateQty(productId: number, fn: (q: number) => number): void {
    if (isHeld) return;
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    if (idx === -1) return;
    const item = orders[idx].items.find((i) => i.productId === productId);
    if (item) {
      item.qty = fn(item.qty);
    }
  }

  let numpadProductId = $state<number | null>(null);
  function openNumpad(productId: number): void {
    if (isHeld) return;
    numpadProductId = productId;
  }

  function closeNumpad(): void {
    if (featuredEntry && featuredEntry.qty === 0) {
      mutateQty(featuredEntry.productId, () => 1);
    }
    numpadProductId = null;
  }

  function numpadPress(val: string): void {
    if (!numpadProductId) return;
    let current = featuredEntry?.qty === 0 ? "" : String(featuredEntry?.qty ?? "");
    if (val === "backspace") {
      current = current.slice(0, -1);
    } else if (val === "clear") {
      current = "";
    } else {
      current += val;
    }

    const parsed = current === "" ? 0 : parseInt(current);
    mutateQty(numpadProductId, () => parsed);
  }

  function holdOrder(): void {
    if (!activeOrder || isEmpty) return;
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    orders[idx].status = orders[idx].status === "held" ? "active" : "held";
  }

  let showCancelModal = $state<boolean>(false);
  let showNoteModal = $state<boolean>(false);
  let draftNote = $state<string>("");
  let showDiscountModal = $state<boolean>(false);
  let draftDiscount = $state<string>("");
  let showHistoryModal = $state<boolean>(false);
  let showPayModal = $state<boolean>(false);
  let showPayConfirmModal = $state<boolean>(false);
  let payMethod = $state<PaymentMethod>("cash");
  let expandedHistoryIds = $state<string[]>([]);

  let anyModalOpen = $derived<boolean>(
    showPayModal || showPayConfirmModal || showCancelModal || showNoteModal || showDiscountModal || showHistoryModal || showSettingsModal
  );

  function toggleHistory(id: string): void {
    expandedHistoryIds = expandedHistoryIds.includes(id) ? expandedHistoryIds.filter((i) => i !== id) : [...expandedHistoryIds, id];
  }

  function printReceipt(id: string): void {
    showToast(`Printing receipt for Order #${id}…`);
  }

  function openCancel(): void {
    if (activeOrder && !isHeld) showCancelModal = true;
  }

  function confirmCancel(): void {
    pastOrders = [{ id: activeOrderId!, date: new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }), total: 0, status: "cancelled", method: "-", items: [...(activeOrder?.items ?? [])] }, ...pastOrders];
    orders = orders.filter((o) => o.id !== activeOrderId);
    activeOrderId = null;
    showCancelModal = false;
  }

  function openNote(): void {
    if (activeOrder && !isHeld) {
      draftNote = activeOrder.note ?? "";
      showNoteModal = true;
    }
  }

  function saveNote(): void {
    const idx = orders.findIndex((o) => o.id === activeOrderId);
    orders[idx].note = draftNote;
    showNoteModal = false;
  }

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

  function openPay(): void {
    if (activeOrder && !isEmpty && !isHeld) {
      showPayModal = true;
      payMethod = "cash";
    }
  }

  function openPayConfirm(): void {
    showPayModal = false;
    showPayConfirmModal = true;
  }

  function processPayment(): void {
    const id = activeOrderId!;
    pastOrders = [{ id, total, status: "paid", method: payMethod, date: new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }), items: [...(activeOrder?.items ?? [])] }, ...pastOrders];
    orders = orders.filter((o) => o.id !== id);
    activeOrderId = null;
    showPayConfirmModal = false;
    showToast(`Order #${id} paid via ${payMethod.toUpperCase()} — ${fmt(total)}`);
    newOrder();
  }

  function confirmPay(): void {
    processPayment();
  }

  function confirmPayAndPrint(): void {
    const id = activeOrderId!;
    processPayment();
    printReceipt(id);
  }

  function openSettings(): void {
    showSettingsModal = true;
    detectPrinters();
  }

  function detectPrinters(): void {
    isDetectingPrinters = true;
    printers = [];
    setTimeout(() => {
      printers = [
        "Epson TM-T88VI Receipt",
        "HP LaserJet Pro M404n",
        "Star TSP143III USB",
        "Microsoft Print to PDF"
      ];
      selectedPrinter = printers[0];
      isDetectingPrinters = false;
    }, 1200);
  }

  function saveSettings(): void {
    showSettingsModal = false;
    showToast(`Printer set to: ${selectedPrinter}`);
  }

  let scanning = $state<boolean>(false);
  let scanFlash = $state<boolean>(false);
  function triggerScan(): void {
    if (scanning || isHeld) return;
    scanning = true;
    setTimeout(() => {
      const product = catalog[Math.floor(Math.random() * catalog.length)];
      addItem(product.id);
      scanFlash = true;
      showToast(`Scanned: ${product.name}`);
      scanning = false;
      setTimeout(() => {
        scanFlash = false;
      }, 2000);
    }, 1400);
  }

  let searchQuery = $state<string>("");
  let searchMode = $state<"catalog" | "barcode">("barcode");
  let selectedCategory = $state<string | null>(null);
  let filteredCatalog = $derived.by<Product[]>(() => {
    const hasQuery = searchQuery.trim() !== "";
    const hasCat = selectedCategory !== null;
    if (!hasQuery && !hasCat) return [];
    return catalog.filter((p) => {
      const matchesSearch = !hasQuery || (searchMode === "catalog" ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : p.barcode.includes(searchQuery.trim()));
      const matchesCategory = !hasCat || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  });

  function handleSearchKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" && searchMode === "barcode" && searchQuery.trim() !== "") {
      const found = catalog.find((p) => p.barcode === searchQuery.trim());
      if (found) {
        addItem(found.id);
        searchQuery = "";
        scanFlash = true;
        showToast(`Added: ${found.name}`);
        setTimeout(() => {
          scanFlash = false;
        }, 2000);
      } else showToast("Barcode not found");
    }
  }

  function selectCategory(cat: string): void {
    selectedCategory = selectedCategory === cat ? null : cat;
    searchMode = "catalog";
    searchQuery = "";
  }

  let historySearch = $state<string>("");
  let historyFilter = $state<"all" | "paid" | "cancelled">("all");

  let filteredPastOrders = $derived<PastOrder[]>(
    pastOrders.filter((po) => {
      const matchesFilter = historyFilter === "all" || po.status === historyFilter;
      const matchesSearch = historySearch.trim() === "" || po.id.includes(historySearch.trim());
      return matchesFilter && matchesSearch;
    }),
  );

  const paymentOptions: PaymentOption[] = [
    { id: "cash", label: "Cash", icon: `<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><path d="M6 12H6.01M18 12H18.01"/>` },
    { id: "card", label: "Card", icon: `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>` },
    { id: "transfer", label: "Transfer", icon: `<path d="M7 17L17 7M17 7H7M17 7v10"/>` },
  ];

  function handleMainKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") closeNumpad();
  }
</script>

{#if toast}
  <div class="toast-container">
    <div class="toast-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
      {toast}
    </div>
  </div>
{/if}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="flex flex-col h-screen overflow-hidden main-font bg-zinc-100 text-[#0A0A0A] antialiased select-none"
  onclick={closeNumpad}
  onkeydown={handleMainKeydown}
  oncontextmenu={(e) => e.preventDefault()}
  role="application"
  aria-label="Vine POS"
>
  <header
    class="flex-shrink-0 h-12 bg-white border-b border-zinc-200 flex items-center justify-between px-5 z-10"
    inert={anyModalOpen || undefined}
  >
    <span class="font-['Syne',sans-serif] font-extrabold text-[20px] tracking-[0.2em] uppercase">Vine</span>
    <div class="flex items-center gap-3">
      <span class="font-['DM_Mono',monospace] text-[14px] text-zinc-500 min-w-[170px] text-right">{dateString} &bull; {timeString}</span>
      <div class="w-px h-[22px] bg-zinc-200"></div>
      <div class="flex items-center gap-2 p-[4px_10px_4px_4px] border border-zinc-200 rounded-full bg-neutral-50">
        <div class="w-[26px] h-[26px] rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-[11px] font-bold tracking-[0.05em]">AJ</div>
        <span class="text-[14px] font-semibold text-zinc-700">Alex J.</span>
      </div>
      
      <button
        onclick={openSettings}
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
      </button>
    </div>
  </header>

  <main class="flex flex-1 overflow-hidden min-h-0" inert={anyModalOpen || undefined}>
    <section class="flex-1 flex flex-col p-[14px] gap-[10px] overflow-hidden min-h-0">
      <div class="flex items-center gap-2 h-10 flex-shrink-0">
        <div class="flex gap-[6px] overflow-x-auto flex-1 hide-scrollbar">
          {#each orders.filter((o) => o.id !== activeOrderId) as o (o.id)}
            {@const t = orderTotal(o)}
            <button
              class="flex items-center gap-2 bg-white border rounded-full px-3 h-9 whitespace-nowrap flex-shrink-0 transition-all border-zinc-200 {isLocked ? 'opacity-40 cursor-not-allowed pointer-events-none grayscale' : 'hover:border-zinc-400'}"
              onclick={(e) => {
                e.stopPropagation();
                selectOrder(o.id);
              }}
              aria-label="Switch to order #{o.id}"
            >
              <span class="w-[6px] h-[6px] rounded-full {o.status === 'held' ? 'bg-amber-500' : 'bg-green-500'} flex-shrink-0"></span>
              <span class="text-[13px] text-zinc-400 font-medium pr-2 border-r border-zinc-200">#{o.id}</span>
              <span class="font-['DM_Mono',monospace] text-[14px] font-medium text-zinc-500">{orderItems(o).length ? fmt(t) : "Empty"}</span>
            </button>
          {/each}
        </div>
        <div class="flex gap-[3px] bg-zinc-200 p-1 rounded-[10px] flex-shrink-0">
          <button
            onclick={(e) => {
              e.stopPropagation();
              newOrder();
            }}
            class="text-white border-none rounded-[7px] p-[5px_14px] text-[14px] font-medium cursor-pointer transition-colors {isLocked ? 'bg-zinc-400 cursor-not-allowed' : isEmpty || activeOrderId === null ? 'bg-zinc-400 opacity-60 cursor-not-allowed' : 'bg-[#0A0A0A] hover:opacity-80'}">New Order</button
          >
          <button
            onclick={(e) => {
              e.stopPropagation();
              showHistoryModal = true;
            }}
            class="text-zinc-500 border-none rounded-[7px] p-[5px_14px] text-[14px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-black/5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            History
          </button>
        </div>
      </div>

      {#if isHeld}
        <div class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-[12px] px-4 py-2.5 flex-shrink-0">
          <div class="w-[6px] h-[6px] rounded-full bg-amber-500 flex-shrink-0 animate-pulse"></div>
          <p class="text-[14px] font-medium text-amber-700 flex-1">This order is on hold — editing is disabled. Click <span class="font-bold">Resume</span> to continue.</p>
        </div>
      {/if}

      {#if isEmpty}
        <div class="bg-white border border-dashed border-zinc-300 rounded-[16px] p-5 flex items-center gap-4 flex-shrink-0">
          <div class="w-[72px] h-[72px] rounded-[12px] bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300 flex-shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></svg>
          </div>
          <div>
            <p class="text-[16px] font-bold text-zinc-400">No item selected</p>
            <p class="text-[13px] text-zinc-400 font-medium mt-[3px]">Add items from the catalog on the right or scan a barcode</p>
          </div>
        </div>
      {:else if featuredEntry}
        {@const fp = featuredEntry.product}
        <div class="bg-white border border-zinc-200 rounded-[16px] p-[14px] flex gap-[14px] flex-shrink-0 relative {isHeld ? 'opacity-60 pointer-events-none' : ''}">
          <div class="w-[100px] h-[100px] bg-zinc-100 rounded-[12px] overflow-hidden flex-shrink-0">
            <img src={fp.img} alt={fp.name} class="w-full h-full object-cover mix-blend-multiply" />
          </div>
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <p class="text-2xl font-bold text-[#0A0A0A] leading-tight mb-[3px]">{fp.name}</p>
              <p class="font-['DM_Mono',monospace] text-[14px] text-zinc-500">{fmt(fp.price)} / {fp.unit}</p>
            </div>
            <div class="flex justify-between items-end mt-[10px]">
              <div class="flex items-center gap-[10px] bg-zinc-100 rounded-[10px] p-[5px] relative">
                <button
                  aria-label="Decrease quantity"
                  onclick={(e) => {
                    e.stopPropagation();
                    decQty(fp.id);
                  }}
                  class="w-[30px] h-[30px] bg-white border border-zinc-200 rounded-[7px] text-[20px] flex items-center justify-center leading-none hover:bg-zinc-50 active:scale-90 active:bg-zinc-200 transition-all">−</button
                >
                <input
                  type="text"
                  value={featuredEntry.qty === 0 ? "" : featuredEntry.qty}
                  aria-label="Item quantity"
                  oninput={(e) => {
                    const val = e.currentTarget.value.replace(/[^0-9]/g, "");
                    mutateQty(fp.id, () => (val === "" ? 0 : parseInt(val)));
                  }}
                  onfocus={(e) => {
                    e.stopPropagation();
                    openNumpad(fp.id);
                  }}
                  onclick={(e) => {
                    e.stopPropagation();
                    openNumpad(fp.id);
                  }}
                  class="w-10 text-center bg-transparent font-['DM_Mono',monospace] text-[18px] font-medium text-[#0A0A0A] outline-none hide-spinners m-0 p-0 cursor-pointer"
                  readonly={isHeld}
                />
                <button
                  aria-label="Increase quantity"
                  onclick={(e) => {
                    e.stopPropagation();
                    incQty(fp.id);
                  }}
                  class="w-[30px] h-[30px] bg-white border border-zinc-200 rounded-[7px] text-[20px] flex items-center justify-center leading-none hover:bg-zinc-50 active:scale-90 active:bg-zinc-200 transition-all">+</button
                >

                {#if numpadProductId === fp.id}
                  <div
                    class="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white border border-zinc-200 rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3 w-[220px] z-50 animate-slide-up"
                    role="dialog"
                    aria-label="Quantity numpad"
                    tabindex="-1"
                    onmousedown={(e) => e.preventDefault()}
                    onclick={(e) => e.stopPropagation()}
                    onkeydown={(e) => e.stopPropagation()}
                  >
                    <div class="grid grid-cols-3 gap-2 mb-2">
                      {#each ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as num}
                        <button onclick={() => numpadPress(num)} class="h-11 bg-zinc-50 border border-zinc-200 rounded-[10px] text-[18px] font-semibold text-[#0A0A0A] hover:bg-zinc-100 active:scale-95 transition-all">{num}</button>
                      {/each}
                      <button onclick={() => numpadPress("clear")} class="h-11 bg-zinc-50 border border-zinc-200 rounded-[10px] text-[14px] font-bold text-zinc-600 hover:bg-zinc-100 active:scale-95 transition-all uppercase tracking-wider">C</button>
                      <button onclick={() => numpadPress("0")} class="h-11 bg-zinc-50 border border-zinc-200 rounded-[10px] text-[18px] font-semibold text-[#0A0A0A] hover:bg-zinc-100 active:scale-95 transition-all">0</button>
                      <button
                        aria-label="Backspace"
                        onclick={() => numpadPress("backspace")}
                        class="h-11 bg-zinc-100 border border-zinc-200 rounded-[10px] flex items-center justify-center text-zinc-600 hover:bg-zinc-200 active:scale-95 transition-all"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
                      </button>
                    </div>
                    <button onclick={closeNumpad} class="w-full h-11 bg-[#0A0A0A] text-white rounded-[10px] text-[15px] font-bold hover:opacity-80 active:scale-95 transition-all">Done</button>
                  </div>
                {/if}
              </div>

              <div class="text-right">
                <p class="text-[11px] font-bold tracking-[0.1em] uppercase text-zinc-400 mb-[2px]">Subtotal</p>
                <p class="font-['DM_Mono',monospace] text-[26px] font-semibold text-[#0A0A0A] leading-none">{fmt(fp.price * featuredEntry.qty)}</p>
              </div>
            </div>
          </div>
          <button
            aria-label="Remove {fp.name} from order"
            onclick={(e) => {
              e.stopPropagation();
              removeItem(fp.id);
            }}
            class="absolute top-3 right-3 w-[28px] h-[28px] bg-zinc-100 border-none rounded-[7px] flex items-center justify-center text-zinc-400 cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          </button>
        </div>
      {/if}

      <div class="grid grid-cols-4 gap-2 flex-shrink-0">
        <button
          onclick={(e) => {
            e.stopPropagation();
            openNote();
          }}
          class="cursor-pointer bg-white border rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px] text-[14px] font-medium transition-colors {isEmpty || isHeld ? 'opacity-40 pointer-events-none border-zinc-200 text-zinc-700' : activeOrder?.note ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-zinc-200 text-zinc-700 hover:bg-neutral-50 hover:border-zinc-300'}"
        >
          <svg class="size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10.5V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H12M14 11H8M10 15H8M16 7H8M18 21V15M15 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="pt-1">{activeOrder?.note ? "Edit Note" : "Add Note"}</span>
        </button>
        <button
          onclick={(e) => {
            e.stopPropagation();
            holdOrder();
          }}
          class="cursor-pointer bg-white border rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px] text-[14px] font-medium transition-colors {isEmpty ? 'opacity-40 pointer-events-none border-zinc-200 text-zinc-700' : isHeld ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-zinc-200 text-zinc-700 hover:bg-neutral-50 hover:border-zinc-300'}"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9L9 15M15 9L15 15M7.8 21H16.2C17.88 21 18.72 21 19.36 20.67A3 3 0 0 0 20.67 19.36C21 18.72 21 17.88 21 16.2V7.8C21 6.12 21 5.28 20.67 4.64A3 3 0 0 0 19.36 3.33C18.72 3 17.88 3 16.2 3H7.8C6.12 3 5.28 3 4.64 3.33A3 3 0 0 0 3.33 4.64C3 5.28 3 6.12 3 7.8V16.2C3 17.88 3 18.72 3.33 19.36A3 3 0 0 0 4.64 20.67C5.28 21 6.12 21 7.8 21Z" /></svg>
          <span class="pt-px">{isHeld ? "Resume" : "Hold Order"}</span>
        </button>
        <button
          onclick={(e) => {
            e.stopPropagation();
            openDiscount();
          }}
          class="cursor-pointer bg-white border rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px] text-[14px] font-semibold transition-colors {isEmpty || isHeld ? 'opacity-40 pointer-events-none border-zinc-200 text-zinc-700' : (activeOrder?.discount ?? 0) > 0 ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-zinc-200 text-zinc-700 hover:bg-neutral-50 hover:border-zinc-300'}"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
          <span class="pt-px">{(activeOrder?.discount ?? 0) > 0 ? `−${fmt(activeOrder!.discount)}` : "Discount"}</span>
        </button>
        <button
          onclick={(e) => {
            e.stopPropagation();
            openCancel();
          }}
          class="cursor-pointer bg-white border border-zinc-200 rounded-[11px] p-[9px_8px] flex items-center justify-center gap-[6px] text-[14px] font-medium text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors {isEmpty || isHeld ? 'opacity-40 pointer-events-none' : ''}"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.88 21 18.72 21 19.36 20.67A3 3 0 0 0 20.67 19.36C21 18.72 21 17.88 21 16.2V7.8C21 6.12 21 5.28 20.67 4.64A3 3 0 0 0 19.36 3.33C18.72 3 17.88 3 16.2 3H7.8C6.12 3 5.28 3 4.64 3.33A3 3 0 0 0 3.33 4.64C3 5.28 3 6.12 3 7.8V16.2C3 17.88 3 18.72 3.33 19.36A3 3 0 0 0 4.64 20.67C5.28 21 6.12 21 7.8 21Z" /></svg>
          <span class="pt-px">Cancel Order</span>
        </button>
      </div>

      <div class="flex-1 bg-white border border-zinc-200 rounded-[12px] overflow-hidden min-h-0 relative">
        {#if isEmpty}
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 z-20 bg-white">
            <div class="relative">
              <div class="absolute -top-1 -right-1 w-[64px] h-[80px] bg-zinc-100 border border-zinc-200 rounded-[8px] rotate-[6deg]"></div>
              <div class="absolute -top-0.5 -right-0.5 w-[64px] h-[80px] bg-zinc-50 border border-zinc-200 rounded-[8px] rotate-[3deg]"></div>
              <div class="relative w-[64px] h-[80px] bg-white border border-zinc-200 rounded-[8px] shadow-md flex flex-col items-center justify-center gap-[5px] p-2.5">
                <div class="w-full h-[5px] bg-zinc-100 rounded-full"></div>
                <div class="w-4/5 h-[4px] bg-zinc-100 rounded-full"></div>
                <div class="w-full h-[4px] bg-zinc-100 rounded-full"></div>
                <div class="w-3/5 h-[4px] bg-zinc-100 rounded-full"></div>
                <div class="w-px h-[6px] bg-zinc-200 my-[1px]"></div>
                <div class="w-full h-[5px] bg-zinc-200 rounded-full"></div>
              </div>
              <div class="absolute -bottom-2 -right-2 w-[20px] h-[20px] bg-[#0A0A0A] rounded-full flex items-center justify-center shadow">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19" /></svg>
              </div>
            </div>
            <div class="text-center">
              <p class="text-[15px] font-bold text-[#0A0A0A] mb-1">Order is empty</p>
              <p class="text-[13px] text-zinc-400 font-medium leading-relaxed max-w-[200px]">Browse the catalog or scan a product to get started.</p>
            </div>
          </div>
        {/if}

        <!-- pos table -->
        <div class="w-full h-full overflow-y-auto table-scrollbar-container box-border">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#0A0A0A] sticky top-0 z-10">
              <tr>
                <th class="w-12 py-2 pl-4 pr-2"></th>
                <th class="py-2 px-2 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80">Item</th>
                <th class="w-[100px] py-2 px-2 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80">Price</th>
                <th class="w-[60px] py-2 px-2 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80 text-center">Qty</th>
                <th class="w-[100px] py-2 pl-2 pr-4 text-[12px] font-bold tracking-[0.08em] uppercase text-white/80 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {#each activeItems as item (item.productId)}
                {@const p = item.product}
                {@const isSelected = item.productId === featuredEntry?.productId}
                <tr
                  class="border-b border-zinc-100 cursor-pointer transition-colors {isSelected ? 'bg-zinc-100' : 'hover:bg-neutral-50'}"
                  onclick={(e) => {
                    e.stopPropagation();
                    selectedProductId = item.productId;
                  }}
                  onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectedProductId = item.productId; } }}
                  tabindex="0"
                  aria-selected={isSelected}
                >
                  <td class="py-2 pl-4 pr-2">
                    <div class="w-8 h-8 rounded-[6px] overflow-hidden bg-zinc-100">
                      <img src={p.img} alt="" class="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td class="py-2 px-2 min-w-[120px]">
                    <p class="text-[14px] font-medium text-[#0A0A0A] truncate">{p.name}</p>
                    <p class="text-[12px] text-zinc-400 mt-[1px]">{p.category} · {p.unit}</p>
                  </td>
                  <td class="py-2 px-2">
                    <div class="font-['DM_Mono',monospace] text-[15px] font-medium text-zinc-600">{fmt(p.price)}</div>
                  </td>
                  <td class="py-2 px-2 text-center">
                    <div class="font-['DM_Mono',monospace] text-[15px] font-medium text-zinc-700">{item.qty}</div>
                  </td>
                  <td class="py-2 pl-2 pr-4 text-right">
                    <div class="font-['DM_Mono',monospace] text-[15px] font-medium text-[#0A0A0A]">{fmt(p.price * item.qty)}</div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex w-full flex-shrink-0">
        <div class="bg-[#0A0A0A] rounded-2xl p-[14px_20px] flex justify-between items-center w-full h-20">
          <div class="flex gap-7">
            <div>
              <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-yellow-300/40 mb-1">Items</p>
              <p class="font-['DM_Mono',monospace] text-[24px] font-medium {isEmpty ? 'text-white/25' : 'text-yellow-300'} leading-none">{isEmpty ? "0" : activeItems.length}</p>
            </div>
            <div>
              <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">Subtotal</p>
              <p class="font-['DM_Mono',monospace] text-[24px] font-medium {isEmpty ? 'text-white/25' : 'text-white'} leading-none">{isEmpty ? "₦0.00" : fmt(subtotal)}</p>
            </div>
            <div>
              <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-green-300/50 mb-1">Discount</p>
              <p class="font-['DM_Mono',monospace] text-[24px] font-medium {(activeOrder?.discount ?? 0) > 0 ? 'text-green-300' : 'text-white/20'} leading-none">{(activeOrder?.discount ?? 0) > 0 ? `−${fmt(activeOrder!.discount)}` : "—"}</p>
            </div>
          </div>
          <div class="text-right pr-5">
            <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">Total to Pay</p>
            <p class="font-['DM_Mono',monospace] text-[36px] font-medium {isEmpty ? 'text-white/25' : 'text-white'} leading-none tracking-[-0.02em]">{isEmpty ? "₦0.00" : fmt(total)}</p>
          </div>
        </div>
        <div class="h-20 ml-2">
          <button
            onclick={(e) => {
              e.stopPropagation();
              openPay();
            }}
            disabled={isEmpty || isHeld}
            class="px-8 py-2.5 h-20 flex flex-col items-center justify-center rounded-2xl font-bold text-2xl transition-all {isEmpty || isHeld ? 'bg-zinc-300 text-zinc-400 cursor-not-allowed' : 'bg-yellow-500/50 text-black hover:bg-yellow-500/40 active:scale-95 cursor-pointer'}">Pay</button
          >
        </div>
      </div>
    </section>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <aside class="w-[380px] bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-hidden" onclick={(e) => e.stopPropagation()}>
      <div class="flex-shrink-0 p-3 pb-3 border-b border-zinc-100">
        <div class="flex bg-zinc-100 p-[3px] rounded-[10px] gap-[3px] items-center">
          <button
            onclick={() => {
              searchMode = "barcode";
              searchQuery = "";
              selectedCategory = null;
            }}
            class="flex-1 flex items-center justify-center gap-[7px] py-[7px] rounded-[8px] cursor-pointer text-[13px] font-medium transition-all {searchMode === 'barcode' ? 'bg-white shadow-sm text-[#0A0A0A] border border-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}"
          >
            <svg class="size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16M3 12H3.01M7.5 12H7.51M16.5 12H16.51M12 12H12.01M21 12H21.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Barcode
          </button>
          <button
            onclick={() => {
              searchMode = "catalog";
              searchQuery = "";
            }}
            class="flex-1 flex items-center cursor-pointer justify-center gap-[7px] py-[7px] rounded-[8px] text-[13px] font-medium transition-all {searchMode === 'catalog' ? 'bg-white shadow-sm text-[#0A0A0A] border border-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Catalog
          </button>
        </div>
      </div>

      {#if searchMode === "barcode"}
        <BarcodePanel {isHeld} />
      {:else}
        <CatalogPanel {categories} />
      {/if}
    </aside>
  </main>
</div>

{#if showPayModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="pay-modal-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[20px] w-full max-w-[340px] shadow-2xl overflow-hidden animate-slide-up max-h-[90vh]" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="bg-[#0A0A0A] p-5">
        <p class="text-[12px] font-bold tracking-[0.12em] uppercase text-white/40 mb-1">Pay Order #{activeOrderId}</p>
        <p id="pay-modal-title" class="font-['DM_Mono',monospace] text-[42px] font-medium text-white leading-none tracking-[-0.02em]">{fmt(total)}</p>
        {#if (activeOrder?.discount ?? 0) > 0}
          <p class="text-[13px] text-green-300/80 font-medium mt-1">Discount of {fmt(activeOrder!.discount)} applied</p>
        {/if}
      </div>
      <div class="p-5">
        <p class="text-[12px] font-bold tracking-[0.1em] uppercase text-zinc-400 mb-3">Payment Method</p>
        <div class="grid grid-cols-3 gap-2 mb-5">
          {#each paymentOptions as m}
            <button onclick={() => (payMethod = m.id)} aria-pressed={payMethod === m.id} class="flex flex-col items-center gap-2 p-1.5 rounded-[12px] border-2 transition-all {payMethod === m.id ? 'border-[#0A0A0A] bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="{payMethod === m.id ? 'text-[#0A0A0A]' : 'text-zinc-400'} size-5">{@html m.icon}</svg>
              <span class="text-[10px] font-bold tracking-[0.06em] uppercase {payMethod === m.id ? 'text-[#0A0A0A]' : 'text-zinc-400'}">{m.label}</span>
            </button>
          {/each}
        </div>
        <div class="bg-zinc-50 rounded-[12px] p-3 mb-3 divide-y divide-zinc-200 max-h-36 overflow-y-auto custom-scrollbar">
          {#each activeItems as item}
            <div class="flex justify-between items-center py-1.5 first:pt-0 last:pb-0">
              <span class="text-[13px] font-medium text-zinc-600 truncate max-w-[160px]">{item.product.name} ×{item.qty}</span>
              <span class="font-['DM_Mono',monospace] text-[13px] font-medium text-zinc-800">{fmt(item.product.price * item.qty)}</span>
            </div>
          {/each}
        </div>
        <div class="flex gap-2">
          <button onclick={() => (showPayModal = false)} class="flex-1 py-3 rounded-[12px] border border-zinc-200 text-[15px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
          <button onclick={openPayConfirm} class="flex-1 py-3 rounded-[12px] bg-[#0A0A0A] text-white text-[15px] font-semibold hover:opacity-80 active:scale-95 transition-all">Confirm</button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showPayConfirmModal}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="pay-confirm-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[24px] w-full max-w-[340px] shadow-2xl overflow-hidden animate-slide-up" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="flex flex-col items-center pt-8 pb-6 px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div>
        <p id="pay-confirm-title" class="text-[20px] font-bold text-[#0A0A0A] mb-1">Confirm Payment?</p>
        <p class="text-[14px] text-zinc-500">
          Order <span class="font-semibold text-zinc-700">#{activeOrderId}</span> &bull; <span class="font-['DM_Mono',monospace] font-semibold text-zinc-700">{fmt(total)}</span>
          via <span class="capitalize font-semibold text-zinc-700">{payMethod}</span>
        </p>
      </div>
      <div class="px-5 pb-5 flex flex-col gap-2">
        <button
          onclick={confirmPayAndPrint}
          class="w-full py-3 rounded-[12px] bg-zinc-800 text-white text-[15px] font-medium hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" /></svg>
          Confirm &amp; Print Receipt
        </button>
        <button
          onclick={confirmPay}
          class="w-full py-3 rounded-[12px] bg-gray-500 text-white text-[15px] font-medium hover:opacity-80 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Confirm
        </button>
        <button
          onclick={() => { showPayConfirmModal = false; showPayModal = true; }}
          class="w-full py-3 rounded-[12px] border border-zinc-200 text-[15px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showCancelModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-modal-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[20px] w-full max-w-[320px] shadow-2xl p-6 text-center animate-slide-up" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h3 id="cancel-modal-title" class="text-[20px] font-bold text-[#0A0A0A] mb-2">Cancel Order?</h3>
      <p class="text-[14px] text-zinc-500 mb-6">Are you sure you want to cancel Order #{activeOrderId}? This action cannot be undone.</p>
      <div class="flex gap-2">
        <button onclick={() => (showCancelModal = false)} class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Keep Order</button>
        <button onclick={confirmCancel} class="flex-1 py-2.5 rounded-[12px] bg-red-600 text-white text-[14px] font-semibold hover:bg-red-700 active:scale-95 transition-all">Cancel Order</button>
      </div>
    </div>
  </div>
{/if}

{#if showNoteModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="note-modal-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[20px] w-full max-w-[340px] shadow-2xl p-5 animate-slide-up" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <h3 id="note-modal-title" class="text-[18px] font-bold text-[#0A0A0A] mb-3">Order Note</h3>
      <textarea bind:value={draftNote} placeholder="Add special instructions or comments..." aria-label="Order note" class="w-full h-32 p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] resize-none outline-none focus:border-zinc-400 text-[14px] text-[#0A0A0A] mb-4 custom-scrollbar"></textarea>
      <div class="flex gap-2">
        <button onclick={() => (showNoteModal = false)} class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
        <button onclick={saveNote} class="flex-1 py-2.5 rounded-[12px] bg-[#0A0A0A] text-white text-[14px] font-semibold hover:opacity-80 active:scale-95 transition-all">Save Note</button>
      </div>
    </div>
  </div>
{/if}

{#if showDiscountModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="discount-modal-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[20px] w-full max-w-[300px] shadow-2xl p-5 animate-slide-up" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <h3 id="discount-modal-title" class="text-[18px] font-bold text-[#0A0A0A] mb-1">Apply Discount</h3>
      <p class="text-[12px] text-zinc-400 mb-4">Maximum allowed: {fmt(subtotal)}</p>
      <div class="relative mb-5">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold" aria-hidden="true">₦</span>
        <input bind:value={draftDiscount} type="number" placeholder="0" aria-label="Discount amount in Naira" class="w-full pl-7 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-[12px] outline-none focus:border-zinc-400 font-['DM_Mono',monospace] text-[18px] text-[#0A0A0A] hide-spinners" />
      </div>
      <div class="flex gap-2">
        <button onclick={() => (showDiscountModal = false)} class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
        <button onclick={saveDiscount} class="flex-1 py-2.5 rounded-[12px] bg-[#0A0A0A] text-white text-[14px] font-semibold hover:opacity-80 active:scale-95 transition-all">Apply</button>
      </div>
    </div>
  </div>
{/if}

{#if showHistoryModal}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="history-modal-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[24px] w-full max-w-[640px] h-[82vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="bg-[#0A0A0A] px-6 pt-6 pb-5 flex-shrink-0">
        <div class="flex justify-between items-start mb-5">
          <div>
            <h3 id="history-modal-title" class="text-[22px] font-bold text-white leading-tight">Order History</h3>
            <p class="text-[13px] text-white/40 font-medium mt-0.5">Session transactions</p>
          </div>
          <button
            onclick={() => (showHistoryModal = false)}
            aria-label="Close history"
            class="cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all flex-shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div class="flex gap-2">
          <div class="flex-1 flex items-center gap-2 bg-white/10 rounded-[10px] px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input bind:value={historySearch} type="text" placeholder="Search by order ID…" aria-label="Search order history" class="bg-transparent text-[13px] text-white placeholder-white/30 font-medium outline-none w-full" />
          </div>
          <div class="flex gap-1 bg-white/10 p-1 rounded-[10px]" role="group" aria-label="Filter orders">
            {#each ["all", "paid", "cancelled"] as const as f}
              <button onclick={() => (historyFilter = f)} aria-pressed={historyFilter === f} class="px-3 py-1.5 rounded-[7px] text-[12px] font-semibold capitalize transition-all {historyFilter === f ? 'bg-white text-[#0A0A0A]' : 'text-white/50 hover:text-white/80'}">{f}</button>
            {/each}
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar bg-white p-2">
        {#if filteredPastOrders.length === 0}
          <div class="flex flex-col items-center justify-center h-full text-center gap-3">
            <div class="w-14 h-14 rounded-[14px] bg-zinc-50 flex items-center justify-center border border-zinc-100">
              <svg class="size-6 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div>
              <p class="text-[15px] font-medium text-zinc-500">No orders found</p>
              <p class="text-[13px] text-zinc-400 mt-1">{historySearch ? "Try a different search term" : "No past orders yet"}</p>
            </div>
          </div>
        {:else}
          <div class="flex flex-col">
            {#each filteredPastOrders as po}
              {@const isExpanded = expandedHistoryIds.includes(po.id)}
              <div class="bg-white border-b border-zinc-100 last:border-0 transition-all">
                <button
                  class="w-full grid grid-cols-[100px_1fr_1.5fr_80px_24px] gap-4 p-4 text-left hover:bg-zinc-50/50 transition-colors items-center"
                  onclick={() => toggleHistory(po.id)}
                  aria-expanded={isExpanded}
                  aria-label="Order #{po.id} — {po.date} — {po.status} — {fmt(po.total)}"
                >
                  <span class="font-['DM_Mono',monospace] text-[14px] font-medium text-zinc-900">#{po.id}</span>
                  <span class="text-[13px] text-zinc-400 truncate">{po.date}</span>
                  <span class="text-[12px] font-medium text-zinc-500 flex items-center gap-1">
                    {po.status === "paid" ? "Paid" : "Cancelled"}
                    {#if po.method !== "-"}<span class="text-xs font-normal font-mono capitalize text-zinc-400">({po.method})</span>{/if}
                  </span>
                  <span class="font-['DM_Mono',monospace] text-[15px] font-medium text-right {po.status === 'cancelled' ? 'text-zinc-300 line-through' : 'text-[#0A0A0A]'}">{fmt(po.total)}</span>
                  <div class="flex justify-end" aria-hidden="true">
                    <svg class="w-4 h-4 text-zinc-300 transition-transform {isExpanded ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </button>
                {#if isExpanded}
                  <div class="px-4 pb-4 pt-1">
                    {#if po.items.length === 0}
                      <p class="text-[13px] text-zinc-400 italic">No items recorded.</p>
                    {:else}
                      <div class="flex flex-col gap-2 mb-4 bg-zinc-50/50 p-3 rounded-[8px]">
                        {#each po.items as item}
                          {@const product = getProduct(item.productId)}
                          {#if product}
                            <div class="flex justify-between items-center">
                              <span class="text-[13px] text-zinc-600">{product.name} <span class="text-zinc-400 ml-1">×{item.qty}</span></span>
                              <span class="font-['DM_Mono',monospace] text-[13px] text-zinc-800">{fmt(product.price * item.qty)}</span>
                            </div>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                    <div class="flex justify-end">
                      <button
                        onclick={(e) => {
                          e.stopPropagation();
                          printReceipt(po.id);
                        }}
                        class="flex gap-1 cursor-pointer text-[12px] font-medium text-zinc-600 hover:text-[#0A0A0A] border-b border-zinc-300 hover:border-[#0A0A0A] transition-all pb-0.5"
                      >
                        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" /></svg>
                        <span>Print Receipt</span>
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showSettingsModal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="bg-white rounded-[20px] w-full max-w-[380px] shadow-2xl p-6 animate-slide-up" role="document" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        </div>
        <div>
          <h3 class="text-[18px] font-bold text-[#0A0A0A]">Hardware Settings</h3>
          <p class="text-[13px] text-zinc-500 font-medium">Configure local peripherals</p>
        </div>
      </div>
      
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <label class="text-[12px] font-bold tracking-[0.08em] uppercase text-zinc-400">Target Printer</label>
          <button onclick={detectPrinters} class="text-[12px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">Refresh</button>
        </div>

        {#if isDetectingPrinters}
          <div class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] flex items-center gap-3">
            <div class="w-4 h-4 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin"></div>
            <span class="text-[14px] text-zinc-600 font-medium">Scanning local service ports...</span>
          </div>
        {:else if printers.length === 0}
           <div class="w-full p-3 bg-amber-50 border border-amber-200 rounded-[12px] text-[13px] text-amber-700 font-medium">
             Could not detect QZ Tray or local print proxy. Using OS default.
           </div>
        {:else}
          <div class="relative">
            <select bind:value={selectedPrinter} class="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] outline-none focus:border-zinc-400 text-[14px] text-[#0A0A0A] font-medium appearance-none cursor-pointer">
              {#each printers as p}
                <option value={p}>{p}</option>
              {/each}
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        {/if}
      </div>

      <div class="flex gap-2">
        <button onclick={() => (showSettingsModal = false)} class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Close</button>
        <button onclick={saveSettings} class="flex-1 py-2.5 rounded-[12px] bg-[#0A0A0A] text-white text-[14px] font-semibold hover:opacity-80 active:scale-95 transition-all">Save Changes</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: 4px;
  }
  .hide-spinners::-webkit-outer-spin-button,
  .hide-spinners::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .hide-spinners {
    -moz-appearance: textfield;
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

  .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .table-scrollbar-container {
    overflow-y: auto;
  
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  .table-scrollbar-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari/Opera */
  }
 
  [inert] {
    pointer-events: none;
    user-select: none;
    opacity: 0.4;
    transition: opacity 0.15s ease;
  }
</style>