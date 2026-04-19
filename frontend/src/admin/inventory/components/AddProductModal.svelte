<script lang="ts">
  import Dropdown from "../../../shared/dropdown.svelte";
  import type { DropDownOptions, ProductFormData } from "../main/types";

    let { closeAddModal, formData = $bindable(), handleAddProduct, categoryOptions } : {
        closeAddModal: () => void,
        formData: ProductFormData,
        handleAddProduct: (e: Event) => void,
        categoryOptions: DropDownOptions[];
    } = $props();
</script>

 <!-- svelte-ignore a11y_no_static_element_interactions -->
 <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closeAddModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeAddModal(); }}
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="add-modal-title" class="text-lg font-semibold text-black">Add New Product</h2>
        <button
          onclick={closeAddModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form onsubmit={handleAddProduct} class="p-6 space-y-4">
        
        <div>
          <label for="add-name" class="block text-sm font-medium text-neutral-700 mb-1">Product Name *</label>
          <input
            id="add-name"
            type="text"
            bind:value={formData.name}
            required
            placeholder="e.g., Cotton T-Shirt"
            class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white"
          />
        </div>

        <div>
          <label for="add-category" class="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
          <Dropdown
            selected={categoryOptions[0]}
            options={categoryOptions}
            onSelect={(option) => formData.category = option.value}

          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="add-price" class="block text-sm font-medium text-neutral-700 mb-1">Price (&#8358) *</label>
            <input
              id="add-price"
              type="number"
              bind:value={formData.price}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white"
            />
          </div>
          <div>
            <label for="add-stock" class="block text-sm font-medium text-neutral-700 mb-1">Stock *</label>
            <input
              id="add-stock"
              type="number"
              bind:value={formData.quantity}
              required
              min="0"
              placeholder="0"
              class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            onclick={closeAddModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  </div>