<script lang="ts">
  import { onMount } from "svelte";
  import Layout from "../../layouts/Layout.svelte";
  import CatogeryModal from "../components/CatogeryModal.svelte";
  import EditCategoryModal from "../components/EditCategoryModal.svelte";
  import { BASE_URL, formatCurrency } from "../../../utils";
  import DeleteCategoryModal from "../components/DeleteCategoryModal.svelte";
  import AddCategoryModal from "../components/AddCategoryModal.svelte";
  import AddProductModal from "../components/AddProductModal.svelte";
  import Dropdown from "../../../shared/dropdown.svelte";
  import EditProductModal from "../components/EditProductModal.svelte";
  import DeleteProductModal from "../components/DeleteProductModal.svelte";
  import GenerateBarcode from "../components/GenerateBarcode.svelte";
  import ViewProductModal from "../components/ViewProductModal.svelte";
  import { showToast } from "../../../lib/toast";
  import PrintBarcodeModal from "../components/PrintBarcodeModal.svelte";
  import type { Category, DropDownOptions, Product } from "../../../shared/types";
  
  


  let addProductModalOpen = $state(false);
  let editModalProductOpen = $state(false);
  let deleteModalOpen = $state(false);
  let generateBarcodeModalOpen = $state(false);
  let viewProductDetailsModalOpen = $state(false);
  let printBarcodeModalOpen = $state(false);
  

  let printQuantity = $state<number>(1);

  let filterCategory = $state<string>('all');


  let categories = $state<Category[]>([]);
  let categoryOptions = $state<DropDownOptions[]>([])
  let currentCategory = $state<Category | null>(null);
  let addCategoryModalOpen = $state(false);
  let manageCategoriesModalOpen = $state(false);
  let editCategoryModalOpen = $state(false);
  let deleteCategoryModalOpen = $state(false);


  let products = $state<Product[]>([]);
  let currentProduct = $state<Product | null>(null);



  onMount( async () => {
      await getCategories();
      await getProducts();
  });

  const getProducts = async() => {
      const req = await fetch(`${BASE_URL}/products`);
      const res = await req.json();
      products = res;
  }

  const getCategories = async() => {
      const req = await fetch(`${BASE_URL}/categories`);
      const res = await req.json();
      categories = res;
      categoryOptions = res.flatMap( (category: Category) => [{ text: category.categoryName, value: category.id }] );      
  }


  function openGenerateBarcodeModal(product: Product): void {
    currentProduct = product;
    generateBarcodeModalOpen = true;
  }

  function openViewBarcodeModal(product: Product): void {
    currentProduct = product;
    viewProductDetailsModalOpen = true;
  }

  function openPrintBarcodeModal(product: Product): void {
    currentProduct = product;
    printQuantity = 1;
    printBarcodeModalOpen = true;
  }

  function openAddCategoryModal(): void {
    addCategoryModalOpen = true;
  }

  function openManageCategoriesModal(): void {
    manageCategoriesModalOpen = true;
  }

  // Close modals
  function closeAddProductModal(): void { addProductModalOpen = false }
  function closeEditProductModal(): void { editModalProductOpen = false; }
  function closeDeleteProductModal(): void { deleteModalOpen = false; }
  function closeGenerateBarcodeModal(): void { generateBarcodeModalOpen = false; }
  function closeViewProductModal(): void { viewProductDetailsModalOpen = false; }
  function closePrintBarcodeModal(): void { printBarcodeModalOpen = false; }
  function closeAddCategoryModal(): void { addCategoryModalOpen = false; }
  function closeManageCategoriesModal(): void { manageCategoriesModalOpen = false; }
  function closeEditCategoryModal(): void { 
    editCategoryModalOpen = false;
    currentCategory = null;
  }

  function closeDeleteCategoryModal(): void { 
    deleteCategoryModalOpen = false;
    currentCategory = null;
  }


  const openDeleteProductModal = (product: Product): void  => {
    currentProduct = product;
    deleteModalOpen = true;
  }

  const openAddProductModal = (): void => {
    addProductModalOpen = true;
  }

  const openEditProductModal = (product: Product): void => {
    currentProduct = product;
    editModalProductOpen = true;
  }

 const onProductAdded = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getProducts();
    closeAddProductModal()

 }

 const onProductEdited = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getProducts()
    closeEditProductModal()
 }
  
 const onProductDeleted = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getProducts()
    closeDeleteProductModal()
 }
 
  const openEditCategoryModal = (category: Category): void => {
    currentCategory = category;
    editCategoryModalOpen = true;
  }

  function openDeleteCategoryModal(category: Category): void {
    currentCategory = category;
    deleteCategoryModalOpen = true;
  }

  const onCategoryAdded = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getCategories()
    closeAddCategoryModal()
    openManageCategoriesModal()
  }

  const onCategoryEdited = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getCategories()
    closeEditCategoryModal()
    openManageCategoriesModal()
  }

  const onCategoryDeleted = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getCategories()
    closeDeleteCategoryModal()
  }

  const onBarcodeGenerated = async ( e: { message: string }) : Promise<void> => {
    showToast(e.message)
    await getProducts()
    closeGenerateBarcodeModal()
  }


  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (addProductModalOpen) closeAddProductModal();
      if (editModalProductOpen) closeEditProductModal();
      if (deleteModalOpen) closeDeleteProductModal();
      if (generateBarcodeModalOpen) closeGenerateBarcodeModal();
      if (viewProductDetailsModalOpen) closeViewProductModal();
      if (printBarcodeModalOpen) closePrintBarcodeModal();
      if (addCategoryModalOpen) closeAddCategoryModal();
      if (manageCategoriesModalOpen) closeManageCategoriesModal();
      if (editCategoryModalOpen) closeEditCategoryModal();
      if (deleteCategoryModalOpen) closeDeleteCategoryModal();
    }
  }


  $effect(() => {
    const isModalOpen = addProductModalOpen || editModalProductOpen || deleteModalOpen ||
                       generateBarcodeModalOpen || viewProductDetailsModalOpen || printBarcodeModalOpen ||
                       addCategoryModalOpen || manageCategoriesModalOpen || 
                       editCategoryModalOpen || deleteCategoryModalOpen;

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
 
</script>



<Layout>
  <div class="p-4 md:p-8 max-w-7xl mx-auto fade-in">

  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h1 class="text-xl md:text-xl font-bold text-black mb-1">Inventory Management</h1>
      <p class="text-neutral-500 text-sm">Manage your product catalog and stock levels</p>
    </div>
    <div class="flex gap-3">
      <button
        onclick={openManageCategoriesModal}
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-black rounded-xl hover:bg-neutral-50 transition-colors sfocus:ring-2 focus:ring-neutral-400 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
          <path d="M9 21V9M15 21V9"/>
        </svg>
        <span class="font-medium">Manage Categories</span>
      </button>

      <button
        onclick={openAddProductModal}
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-sm focus:ring-2 focus:ring-neutral-400 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        <span class="font-medium">Add Product</span>
      </button>
    </div>
  </div>


  <div class="flex flex-col sm:flex-row gap-3 mb-4">
    <div class="relative flex-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        type="text"
        placeholder="Search products..."
        class="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white"
        aria-label="Search products"
      />
    </div>

    <!-- Custom dropdown: category filter -->
     <Dropdown selected={ categoryOptions[0] } options={categoryOptions} />
    
  </div>

  <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full min-w-225">
        <thead class="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Product Code</th>
            <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Product Name</th>
            <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Category</th>
            <th scope="col" class="text-right px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Price</th>
            <th scope="col" class="text-center px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Barcode</th>
            <th scope="col" class="text-right px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          {#each products as product (product.id)}
          <tr class="table-row transition-colors hover:bg-neutral-50/50">
            <td class="px-4 md:px-6 py-4 font-mono text-xs text-neutral-500 uppercase">{product.productCode}</td>
            <td class="px-4 md:px-6 py-4">
              <div class="font-medium text-sm text-black">{product.productName}</div>
            </td>
            <td class="px-4 md:px-6 py-4">
              <span class="inline-flex px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium border border-neutral-200">{product.category || 'Uncategorized'}</span>
            </td>
            <td class="px-4 md:px-6 py-4 text-right font-medium text-black">&#8358{formatCurrency(product.price)}</td>
            
            <td class="px-4 md:px-6 py-4">
              <div class="flex items-center justify-center gap-1">
                {#if product.barcode}
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Generated
                  </span>
                {:else}
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Pending
                  </span>
                {/if}
              </div>
            </td>
            <td class="px-4 md:px-6 py-4">
              <div class="flex items-center justify-end gap-0.5">

                {#if ! product.barcode}
                  <button
                    onclick={() => openGenerateBarcodeModal(product)}
                    class="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    title="Generate Barcode"
                    aria-label="Generate barcode for {product.productName}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 6h.01"/><path d="M6 2v.01"/><path d="M2 10h.01"/><path d="M2 14h.01"/><path d="M2 18h.01"/>
                      <rect x="6" y="6" width="2" height="12" rx="0.5"/>
                      <rect x="11" y="6" width="1" height="12" rx="0.5"/>
                      <rect x="15" y="6" width="3" height="12" rx="0.5"/>
                      <path d="M22 6h.01"/><path d="M18 2v.01"/><path d="M22 10h.01"/><path d="M22 14h.01"/><path d="M22 18h.01"/>
                    </svg>
                  </button>
                {/if}              

                <!-- View product: clipboard/info icon -->
                <button
                  onclick={() => openViewBarcodeModal(product)}
                  class="p-1.5 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:ring-2 focus:ring-purple-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  title="View Product Details"
                  aria-label="View details for {product.productName}"
                  disabled={!product.barcode}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6"/><path d="M9 16h4"/>
                  </svg>
                </button>

                <button
                  onclick={() => openPrintBarcodeModal(product)}
                  class="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Print Barcode"
                  aria-label="Print barcode for {product.productName}"
                  disabled={!product.barcode}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
                  </svg>
                </button>

                <button
                  onclick={() => openEditProductModal(product)}
                  class="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                  title="Edit"
                  aria-label="Edit {product.productName}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                  </svg>
                </button>
                <button
                  onclick={() => openDeleteProductModal(product)}
                  class="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
                  title="Delete"
                  aria-label="Delete {product.productName}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="px-4 md:px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <div class="text-neutral-500">Showing <span class="font-medium text-black">1-10</span> of <span class="font-medium text-black">{products.length}</span> products</div>
      <div class="flex items-center gap-1.5">
        <button class="px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-neutral-400 focus:outline-none" disabled aria-label="Previous page">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="px-3 py-1.5 bg-black text-white rounded-lg font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-current="page">1</button>
        <button class="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-black transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none">2</button>
        <button class="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-black transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Next page">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  </div>

</div>

<!-- ======================== ADD CATEGORY MODAL ======================== -->
{#if addCategoryModalOpen}
  <AddCategoryModal {onCategoryAdded} {closeAddCategoryModal} {openManageCategoriesModal} />
{/if}

<!-- ======================== MANAGE CATEGORIES MODAL ======================== -->
{#if manageCategoriesModalOpen}
  <CatogeryModal {categories} {closeManageCategoriesModal} {openAddCategoryModal} {openEditCategoryModal} {openDeleteCategoryModal} />
{/if}

<!-- ======================== EDIT CATEGORY MODAL ======================== -->
{#if editCategoryModalOpen && currentCategory}
  <EditCategoryModal {currentCategory} {closeEditCategoryModal} {onCategoryEdited} {categories} />
{/if}

<!-- ======================== DELETE CATEGORY MODAL ======================== -->
{#if deleteCategoryModalOpen && currentCategory}
  <DeleteCategoryModal {currentCategory} {onCategoryDeleted} {closeDeleteCategoryModal} />
{/if}

{#if addProductModalOpen}
  <AddProductModal {categoryOptions} closeAddModal={closeAddProductModal} {onProductAdded}  />
{/if}

<!-- ======================== EDIT PRODUCT MODAL ======================== -->
{#if editModalProductOpen}
  <EditProductModal {categoryOptions} closeEditModal={closeEditProductModal} {onProductEdited} {currentProduct} />
{/if}

<!-- ======================== DELETE PRODUCT MODAL ======================== -->
{#if deleteModalOpen}
  <DeleteProductModal {currentProduct} {onProductDeleted} {closeDeleteProductModal} />
{/if}

<!-- ======================== GENERATE BARCODE MODAL ======================== -->
{#if generateBarcodeModalOpen && currentProduct}
  <GenerateBarcode {currentProduct} {closeGenerateBarcodeModal} {onBarcodeGenerated} />
{/if}

<!-- ======================== VIEW PRODUCT DETAILS MODAL ======================== -->
{#if viewProductDetailsModalOpen && currentProduct?.barcode}
  <ViewProductModal {currentProduct} {closeViewProductModal} />
{/if}

<!-- ======================== PRINT BARCODE MODAL ======================== -->
{#if printBarcodeModalOpen && currentProduct?.barcode}
  <PrintBarcodeModal {closePrintBarcodeModal} {currentProduct}  />
{/if}
</Layout>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.25s ease-out;
  }
</style>