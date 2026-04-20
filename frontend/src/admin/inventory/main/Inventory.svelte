<script lang="ts">
  import { onMount } from "svelte";
  import Layout from "../../layouts/Layout.svelte";
  import type { Category, DropDownOptions, Product, ProductFormData } from "./types";
  import CatogeryModal from "../components/CatogeryModal.svelte";
  import EditCategoryModal from "../components/EditCategoryModal.svelte";
  import { BASE_URL } from "../../../utils";
  import DeleteCategoryModal from "../components/DeleteCategoryModal.svelte";
  import AddCategoryModal from "../components/AddCategoryModal.svelte";
  import AddProductModal from "../components/AddProductModal.svelte";
  import Dropdown from "../../../shared/dropdown.svelte";
  import EditProductModal from "../components/EditProductModal.svelte";
  import DeleteProductModal from "../components/DeleteProductModal.svelte";
  
  

  interface BarcodeScanResult {
    scannedCode: string;
    productName?: string;
    productCategory?: string;
    productPrice?: number;
  }
 

  let addProductModalOpen = $state(false);
  let editModalProductOpen = $state(false);
  let deleteModalOpen = $state(false);
  let generateBarcodeModalOpen = $state(false);
  let viewBarcodeModalOpen = $state(false);
  let printBarcodeModalOpen = $state(false);
  

  let barcodeGenerationMode = $state<'scan' | 'manual'>('manual');
  let scannedBarcodeData = $state<BarcodeScanResult | null>(null);
  let printQuantity = $state<number>(1);

  let filterCategory = $state<string>('all');

  let openDropdown = $state<string | null>(null);

  let categories = $state<Category[]>([]);
  let categoryOptions = $state<DropDownOptions[]>([])
  let currentCategory = $state<Category | null>(null);
  let addCategoryModalOpen = $state(false);
  let manageCategoriesModalOpen = $state(false);
  let editCategoryModalOpen = $state(false);
  let deleteCategoryModalOpen = $state(false);
  let editCategoryName = $state('');
  let newCategoryName = $state('');


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
    barcodeGenerationMode = 'manual';
    scannedBarcodeData = null;
    generateBarcodeModalOpen = true;
  }

  function openViewBarcodeModal(product: Product): void {
    currentProduct = product;
    viewBarcodeModalOpen = true;
  }

  function openPrintBarcodeModal(product: Product): void {
    currentProduct = product;
    printQuantity = 1;
    printBarcodeModalOpen = true;
  }

  function openAddCategoryModal(): void {
    newCategoryName = '';
    addCategoryModalOpen = true;
  }

  function openManageCategoriesModal(): void {
    manageCategoriesModalOpen = true;
  }

  // Close modals
  function closeAddProductModal(): void { addProductModalOpen = false; }
  function closeEditProductModal(): void { editModalProductOpen = false; }
  function closeDeleteModal(): void { deleteModalOpen = false; }
  function closeGenerateBarcodeModal(): void { generateBarcodeModalOpen = false; }
  function closeViewBarcodeModal(): void { viewBarcodeModalOpen = false; }
  function closePrintBarcodeModal(): void { printBarcodeModalOpen = false; }
  function closeAddCategoryModal(): void { addCategoryModalOpen = false; }
  function closeManageCategoriesModal(): void { manageCategoriesModalOpen = false; }
  function closeEditCategoryModal(): void { 
    editCategoryModalOpen = false;
    currentCategory = null;
    editCategoryName = '';
  }

  function closeDeleteCategoryModal(): void { 
    deleteCategoryModalOpen = false;
    currentCategory = null;
  }


  let productFormData = $state<ProductFormData>({
      name: '',
      category: '',
      price: 0,
      quantity: 0
  });


  const openDeleteProductModal = (product: Product): void  => {
    currentProduct = product;
    deleteModalOpen = true;
  }

  const openAddProductModal = (): void => {
    productFormData = { name: '', category: '', price: 0, quantity: 0 };
    addProductModalOpen = true;
  }

  const openEditProductModal = (product: Product): void => {

    currentProduct = product;
    
    productFormData = {
      name: product.productName,
      price: product.price,
      category: product.categoryId,
      quantity: product.quantity,
      image: product.productImage
    };

    editModalProductOpen = true;
  }

  const handleAddProduct =  async (e: Event): Promise<void> =>  {
      e.preventDefault();

      const req = await fetch(`${BASE_URL}/product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              productName: productFormData.name,
              category: productFormData.category,
              price: productFormData.price,
              quantity: productFormData.quantity,
              description: productFormData.description,
              image: productFormData.image
          })
      });

      if( ! req.ok ) {
        const res = await req.json()
        console.log(res)
      }

      await getProducts();

      closeAddProductModal();
  }

  const handleEditProduct = async (e: Event): Promise<void> => {

    e.preventDefault();

    if (  !currentProduct ) return;

    const req = await fetch(`${BASE_URL}/product/update/${currentProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productName: productFormData.name,
            category: productFormData.category,
            price: productFormData.price,
            quantity: productFormData.quantity,
            description: productFormData.description,
            image: productFormData.image
        })
    });

    const res = await req.json();

    if( ! req.ok ) {
      console.log(res);
      return
    } 

    await getProducts();
    
    closeEditProductModal();
  }

  const handleDeleteProduct = async (): Promise<void> => {

    if (!currentProduct) return;

    const req = await fetch(`${BASE_URL}/product/delete/${currentProduct.id}`, {
        method: 'DELETE',
    });

    const res = await req.json();

    if( ! req.ok ) {
      console.log(res);
      return
    }

    await getProducts();

    closeDeleteModal();
  }

  const handleAddCategory = async (e: Event): Promise<void> => {

    e.preventDefault();

    const categoryName = newCategoryName.trim();

    const req = await fetch(`${BASE_URL}/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: categoryName })
    });

    if( ! req.ok ) {
      const res = await req.json()
      console.log(res)
    }

    await getCategories()
    
    closeAddCategoryModal();
    openManageCategoriesModal();
  }

  const openEditCategoryModal = (category: Category): void => {
    currentCategory = category;
    editCategoryName = category.categoryName;    
    editCategoryModalOpen = true;
  }

  function openDeleteCategoryModal(category: Category): void {
    currentCategory = category;
    deleteCategoryModalOpen = true;
  }

  const handleEditCategory = async (e: Event): Promise<void> => {

      e.preventDefault();

      console.log(editCategoryName);
      

      if (!currentCategory || ! editCategoryName.trim()) return;
      
      const newName = editCategoryName.trim();
      
      if ( categories.flatMap((c) => c.categoryName).includes(newName) ) {
        closeEditCategoryModal();
        return;
      }
    
      const req = await fetch(`${BASE_URL}/category/update/${currentCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryName: newName })
      });

      if( ! req.ok ) {
        const res = await req.json()
        console.log(res)
      }

      await getCategories()
    
      closeEditCategoryModal();
  }

  const handleDeleteCategory = async (): Promise<void> => {
    if (! currentCategory) return;

    const req = await fetch(`${BASE_URL}/category/delete/${currentCategory.id}`, {
        method: 'DELETE',
    });

    if( ! req.ok ) {
      const res = await req.json()
      console.log(res)
    }
    
    await getCategories()

    closeDeleteCategoryModal();
  }

 
  // Handle barcode scan simulation (replace with actual scanner integration)
  async function handleBarcodeScan(): Promise<void> {
    // await new Promise(resolve => setTimeout(resolve, 1500));
    // scannedBarcodeData = {
    //   scannedCode: `890${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
    //   productName: currentProduct?.name,
    //   productCategory: currentProduct?.category,
    //   productPrice: currentProduct?.price
    // };
  }

  // Handle manual barcode generation from backend
  async function handleGenerateBarcodeManually(): Promise<void> {
    if (!currentProduct) return;
    const product = currentProduct;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const generatedBarcode = `890${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
      const index = products.findIndex(p => p.id === product.id);
      
      if (index !== -1) {
        products[index] = { ...products[index], barcode: generatedBarcode };
      }

      alert(`Barcode generated: ${generatedBarcode}`);
      closeGenerateBarcodeModal();
    } catch (error) {
      console.error('Failed to generate barcode:', error);
      alert('Failed to generate barcode. Please try again.');
    }
  }

  // Handle applying scanned barcode to product
  function handleApplyScannedBarcode(): void {
    // if (!currentProduct || !scannedBarcodeData) return;
    // const product = currentProduct;
    // const scanData = scannedBarcodeData;
    // const index = products.findIndex(p => p.id === product.id);
    
    // if (index !== -1) {
    //   products[index] = {
    //     ...products[index],
    //     barcode: scanData.scannedCode,
    //     name: scanData.productName || products[index].name,
    //     category: scanData.productCategory || products[index].category,
    //     price: scanData.productPrice || products[index].price
    //   };
    // }
    closeGenerateBarcodeModal();
  }

  // Handle print barcode
  function handlePrintBarcode(): void {
    // if (!currentProduct) return;
    // const product = currentProduct;
    // console.log(`Printing ${printQuantity} barcode(s) for product: ${product.name}`);
    // alert(`Printing ${printQuantity} barcode label(s) for "${product.name}"`);
    closePrintBarcodeModal();
  }

  // Generate barcode bars for visual display
  function generateBarcodeBars(code: string): { width: number; height: number }[] {
    const bars: { width: number; height: number }[] = [];
    const pattern = [3,2,1,1,2,1,3,2,1,2,3,1,1,2,3,1,2,1,1,3,2,1,3,2,1,2,1,3,1,3,2,1,1,2,1,3];
    for (let i = 0; i < code.length; i++) {
      const d = parseInt(code[i]) || 0;
      bars.push({
        width: (d % 3 === 0) ? 3 : (d % 2 === 0) ? 2 : 1,
        height: (d % 3 === 0) ? 100 : (d % 2 === 0) ? 75 : 60
      });
      if (i < code.length - 1) {
        bars.push({ width: 1, height: 0 });
      }
    }
    return bars;
  }

  // Close modal on Escape key
  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (addProductModalOpen) closeAddProductModal();
      if (editModalProductOpen) closeEditProductModal();
      if (deleteModalOpen) closeDeleteModal();
      if (generateBarcodeModalOpen) closeGenerateBarcodeModal();
      if (viewBarcodeModalOpen) closeViewBarcodeModal();
      if (printBarcodeModalOpen) closePrintBarcodeModal();
      if (addCategoryModalOpen) closeAddCategoryModal();
      if (manageCategoriesModalOpen) closeManageCategoriesModal();
      if (editCategoryModalOpen) closeEditCategoryModal();
      if (deleteCategoryModalOpen) closeDeleteCategoryModal();
    }
  }

  // Prevent background scroll when modal is open
  $effect(() => {
    const isModalOpen = addProductModalOpen || editModalProductOpen || deleteModalOpen ||
                       generateBarcodeModalOpen || viewBarcodeModalOpen || printBarcodeModalOpen ||
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

  // Helper to format currency
  function formatCurrency(amount: number): string {
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

 
</script>

<Layout>
  <div class="p-4 md:p-8 max-w-7xl mx-auto fade-in">

  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-black mb-1">Inventory Management</h1>
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
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-green-50 text-green-700 border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Generated
                  </span>
                {:else}
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Pending
                  </span>
                {/if}
              </div>
            </td>
            <td class="px-4 md:px-6 py-4">
              <div class="flex items-center justify-end gap-0.5">

                <!-- Generate barcode: barcode scan icon -->
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
  <AddCategoryModal bind:newCategoryName {handleAddCategory} {closeAddCategoryModal} {openManageCategoriesModal} />
{/if}

<!-- ======================== MANAGE CATEGORIES MODAL ======================== -->
{#if manageCategoriesModalOpen}
  <CatogeryModal {categories} {closeManageCategoriesModal} {openAddCategoryModal} {openEditCategoryModal} {openDeleteCategoryModal} />
{/if}

<!-- ======================== EDIT CATEGORY MODAL ======================== -->
{#if editCategoryModalOpen && currentCategory}
  <EditCategoryModal bind:editCategoryName {handleEditCategory} {closeEditCategoryModal} />
{/if}

<!-- ======================== DELETE CATEGORY MODAL ======================== -->
{#if deleteCategoryModalOpen && currentCategory}
  <DeleteCategoryModal {currentCategory} {handleDeleteCategory} {closeDeleteCategoryModal} />
{/if}

{#if addProductModalOpen}
  <AddProductModal {categoryOptions} closeAddModal={closeAddProductModal} {handleAddProduct} bind:formData={productFormData} />
{/if}

<!-- ======================== EDIT PRODUCT MODAL ======================== -->
{#if editModalProductOpen}
  <EditProductModal {categoryOptions} closeEditModal={closeEditProductModal} {handleEditProduct} bind:formData={productFormData} />
{/if}

<!-- ======================== DELETE PRODUCT MODAL ======================== -->
{#if deleteModalOpen}
  <DeleteProductModal {currentProduct} {handleDeleteProduct} {closeDeleteModal} />
{/if}

<!-- ======================== GENERATE BARCODE MODAL ======================== -->
{#if generateBarcodeModalOpen && currentProduct}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closeGenerateBarcodeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeGenerateBarcodeModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-barcode-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="generate-barcode-modal-title" class="text-lg font-semibold text-black">Generate Barcode</h2>
        <button
          onclick={closeGenerateBarcodeModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <div class="mb-6">
          <p class="text-sm text-neutral-600 mb-1">Product</p>
          <p class="font-medium text-black">{currentProduct.productName}</p>
          <p class="text-sm text-neutral-500">{currentProduct.productName} • {currentProduct.category}</p>
        </div>

        <div class="flex rounded-xl border border-neutral-200 p-1 bg-neutral-50 mb-6">
          <button
            type="button"
            onclick={() => barcodeGenerationMode = 'scan'}
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 {barcodeGenerationMode === 'scan' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'}"
          >
            <span class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"/><path d="M7 16v-4M11 16v-8M15 16v-6M19 16v-2"/>
              </svg>
              Scan Barcode
            </span>
          </button>
          <button
            type="button"
            onclick={() => barcodeGenerationMode = 'manual'}
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 {barcodeGenerationMode === 'manual' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'}"
          >
            <span class="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/>
              </svg>
              Generate from Server
            </span>
          </button>
        </div>

        {#if barcodeGenerationMode === 'scan'}
          <div class="space-y-4">
            <div class="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50">
              {#if scannedBarcodeData}
                <div class="text-center">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p class="font-mono text-lg font-semibold text-black mb-1">{scannedBarcodeData.scannedCode}</p>
                  <p class="text-sm text-neutral-500">Barcode scanned successfully</p>
                </div>
              {:else}
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 text-neutral-400">
                    <path d="M3 3v18h18"/><path d="M7 16v-4M11 16v-8M15 16v-6M19 16v-2"/>
                  </svg>
                  <p class="text-neutral-600 mb-4">Position the barcode within the frame to scan</p>
                  <button
                    onclick={handleBarcodeScan}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Start Scanning
                  </button>
                  <p class="text-xs text-neutral-400 mt-3">Note: Connect a barcode scanner device or use camera API for production</p>
                </div>
              {/if}
            </div>

            {#if scannedBarcodeData}
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 class="font-medium text-blue-900 mb-2">Scanned Details</h4>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                  <dt class="text-blue-700">Code:</dt>
                  <dd class="font-mono text-blue-900">{scannedBarcodeData.scannedCode}</dd>
                  {#if scannedBarcodeData.productName}
                    <dt class="text-blue-700">Name:</dt>
                    <dd class="text-blue-900">{scannedBarcodeData.productName}</dd>
                  {/if}
                  {#if scannedBarcodeData.productCategory}
                    <dt class="text-blue-700">Category:</dt>
                    <dd class="text-blue-900">{scannedBarcodeData.productCategory}</dd>
                  {/if}
                  {#if scannedBarcodeData.productPrice}
                    <dt class="text-blue-700">Price:</dt>
                    <dd class="text-blue-900">₹{formatCurrency(scannedBarcodeData.productPrice)}</dd>
                  {/if}
                </dl>
              </div>
            {/if}
          </div>
        {:else}
          <div class="space-y-4">
            <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <p class="text-sm text-neutral-600">
                A unique barcode will be generated from our backend server and assigned to this product.
              </p>
            </div>

            <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p class="text-sm text-blue-800">
                Generated barcodes follow the EAN-13 standard and are globally unique.
              </p>
            </div>
          </div>
        {/if}

        <div class="flex gap-3 pt-6">
          <button
            type="button"
            onclick={closeGenerateBarcodeModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Cancel
          </button>
          {#if barcodeGenerationMode === 'scan'}
            <button
              onclick={handleApplyScannedBarcode}
              disabled={!scannedBarcodeData}
              class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Barcode
            </button>
          {:else}
            <button
              onclick={handleGenerateBarcodeManually}
              class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
            >
              Generate Barcode
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ======================== VIEW PRODUCT DETAILS MODAL ======================== -->
{#if viewBarcodeModalOpen && currentProduct?.barcode}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closeViewBarcodeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeViewBarcodeModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-barcode-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="view-barcode-modal-title" class="text-lg font-semibold text-black">Product Details</h2>
        <button
          onclick={closeViewBarcodeModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <!-- Product header -->
        <div class="flex items-start gap-4 mb-6 pb-6 border-b border-neutral-100">
          <div class="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-600">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" x2="7.01" y1="7" y2="7"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-black text-lg leading-tight">{currentProduct.productName}</h3>
            <p class="text-sm text-neutral-500 font-mono mt-0.5">{currentProduct.productCode}</p>
          </div>
          <span class="inline-flex px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium border border-neutral-200 flex-shrink-0">{currentProduct.category}</span>
        </div>

        <!-- Product details grid -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <p class="text-xs text-neutral-500 mb-1 font-medium uppercase tracking-wider">Price</p>
            <p class="text-xl font-bold text-black">₹{formatCurrency(currentProduct.price)}</p>
          </div>
          <div class="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            <p class="text-xs text-neutral-500 mb-1 font-medium uppercase tracking-wider">Stock</p>
            <p class="text-xl font-bold text-black">{currentProduct.quantity}</p>
            <p class="text-xs text-neutral-400">units available</p>
          </div>
          <div class="bg-neutral-50 rounded-xl p-4 border border-neutral-100 col-span-2">
            <p class="text-xs text-neutral-500 mb-1 font-medium uppercase tracking-wider">Inventory Value</p>
            <p class="text-xl font-bold text-black">₹{formatCurrency(currentProduct.price * (currentProduct.quantity || 0))}</p>
            <p class="text-xs text-neutral-400">{currentProduct.quantity} units × ₹{formatCurrency(currentProduct.price)}</p>
          </div>
        </div>

        <!-- Barcode section -->
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider">Barcode (EAN-13)</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
              Generated
            </span>
          </div>
          <div class="flex items-end justify-center gap-0.5 h-10 mb-2">
            {#each currentProduct.barcode.split('') as digit}
              <div
                class="bg-neutral-800 rounded-sm"
                style="width: {(['0','3','6','9'].includes(digit)) ? '3px' : '2px'}; height: {parseInt(digit) % 3 === 0 ? '100%' : parseInt(digit) % 2 === 0 ? '72%' : '55%'}"
              ></div>
            {/each}
          </div>
          <p class="text-center font-mono text-sm font-semibold text-neutral-800 tracking-widest">{currentProduct.barcode}</p>
        </div>

        <div class="flex gap-3">
          <button
            onclick={() => {
              if (currentProduct?.barcode) {
                navigator.clipboard.writeText(currentProduct.barcode);
                alert('Barcode copied to clipboard!');
              }
            }}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Copy Barcode
          </button>
          <button
            onclick={() => { if (currentProduct) { closeViewBarcodeModal(); openPrintBarcodeModal(currentProduct); } }}
            class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Print Label
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ======================== PRINT BARCODE MODAL ======================== -->
{#if printBarcodeModalOpen && currentProduct?.barcode}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closePrintBarcodeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closePrintBarcodeModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-barcode-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="print-barcode-modal-title" class="text-lg font-semibold text-black">Print Barcode Labels</h2>
        <button
          onclick={closePrintBarcodeModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handlePrintBarcode(); }} class="p-6 space-y-6">

        <!-- Label preview -->
        <div>
          <p class="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-3">Label Preview</p>
          <div class="flex justify-center">
            <!-- Simulated physical label: ~50mm × 25mm aspect ratio -->
            <div class="relative bg-white border-2 border-neutral-300 rounded-md shadow-md px-4 pt-3 pb-2 w-64" style="font-family: monospace;">
              <!-- Label top: product name + price -->
              <div class="flex items-start justify-between mb-2 gap-2">
                <p class="text-xs font-bold text-black leading-tight truncate flex-1">{currentProduct.productName}</p>
                <p class="text-xs font-bold text-black flex-shrink-0">₹{formatCurrency(currentProduct.price)}</p>
              </div>
              <!-- Category badge -->
              <p class="text-[10px] text-neutral-500 mb-2 uppercase tracking-wider">{currentProduct.category} · {currentProduct.productCode}</p>
              <!-- Barcode bars -->
              <div class="flex items-end justify-center gap-px h-8 mb-1 bg-white">
                <!-- Left guard bars -->
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <!-- Data bars derived from barcode string -->
                {#each currentProduct.barcode.split('') as digit, i}
                  <div class="bg-white" style="width:1px;height:100%"></div>
                  <div
                    class="rounded-sm"
                    style="background:{i % 5 === 0 ? '#000' : i % 3 === 0 ? '#111' : '#000'}; width:{(['0','2','4','6','8'].includes(digit)) ? '3px' : '2px'}; height:{parseInt(digit) % 3 === 0 ? '100%' : parseInt(digit) % 2 === 0 ? '80%' : '65%'}"
                  ></div>
                {/each}
                <!-- Right guard bars -->
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
                <div class="bg-white" style="width:1px;height:100%"></div>
                <div class="bg-black rounded-sm" style="width:2px;height:100%"></div>
              </div>
              <!-- Barcode number -->
              <p class="text-center text-[9px] text-neutral-700 tracking-widest font-mono">{currentProduct.barcode}</p>
              <!-- Label corner cut marks -->
              <div class="absolute top-1 left-1 w-2 h-2 border-t border-l border-neutral-400 rounded-tl-sm"></div>
              <div class="absolute top-1 right-1 w-2 h-2 border-t border-r border-neutral-400 rounded-tr-sm"></div>
              <div class="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-neutral-400 rounded-bl-sm"></div>
              <div class="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-neutral-400 rounded-br-sm"></div>
            </div>
          </div>
          <p class="text-center text-xs text-neutral-400 mt-2">50mm × 25mm · EAN-13</p>
        </div>

        <!-- Quantity selector -->
        <div>
          <label for="print-quantity" class="block text-sm font-medium text-neutral-700 mb-2">Number of Labels</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              onclick={() => printQuantity = Math.max(1, printQuantity - 1)}
              class="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
              aria-label="Decrease quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
              </svg>
            </button>
            <input
              id="print-quantity"
              type="number"
              bind:value={printQuantity}
              min="1"
              max="100"
              class="w-16 px-3 py-2 text-center border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white font-medium"
            />
            <button
              type="button"
              onclick={() => printQuantity = Math.min(100, printQuantity + 1)}
              class="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
              aria-label="Increase quantity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5v14"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-neutral-400 mt-1">Maximum 100 labels per print job</p>
        </div>

        <!-- Print settings -->
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <h4 class="font-medium text-neutral-800 mb-2">Print Settings</h4>
          <ul class="space-y-1.5 text-sm text-neutral-600">
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12"/></svg>
              Label size: 50mm × 25mm
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12"/></svg>
              Format: EAN-13 with human-readable text
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400"><polyline points="20 6 9 17 4 12"/></svg>
              Printer: Default system printer
            </li>
          </ul>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            onclick={closePrintBarcodeModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Print {printQuantity} Label{printQuantity > 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  </div>
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