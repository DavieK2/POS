<script lang="ts">
  import type { Product } from "../main/types";


  let { currentProduct, handleDeleteProduct, closeDeleteModal } : {
    currentProduct: Product | null,
    handleDeleteProduct: () => void,
    closeDeleteModal: () => void
  } = $props();

</script>
<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closeDeleteModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeDeleteModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200">
        <h2 id="delete-modal-title" class="text-lg font-semibold text-black">Confirm Delete</h2>
      </div>

      <div class="p-6">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </div>
          <div>
            <p class="text-neutral-700">Are you sure you want to delete</p>
            <p class="font-semibold text-black">{currentProduct?.productName} <span class="text-neutral-500 font-normal">({currentProduct?.productCode})</span>?</p>
            <p class="text-sm text-neutral-500 mt-2">This action cannot be undone.</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            onclick={closeDeleteModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onclick={handleDeleteProduct}
            class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  </div>