<script lang="ts">
  import type { Category } from "../main/types";

    let { categories, closeManageCategoriesModal, openAddCategoryModal, openEditCategoryModal, openDeleteCategoryModal } : {
        categories: Category[];
        closeManageCategoriesModal: () => void;
        openAddCategoryModal: () => void;
        openEditCategoryModal: (category: Category) => void;
        openDeleteCategoryModal: (category: Category) => void;
    } = $props();

</script>

 <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    onclick={closeManageCategoriesModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeManageCategoriesModal(); }}
    aria-hidden="true"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-categories-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 id="manage-categories-title" class="text-lg font-semibold text-black">Manage Categories</h2>
        <button
          onclick={closeManageCategoriesModal}
          class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6">
        {#if categories.length === 0}
          <div class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 text-neutral-400">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
            </svg>
            <p class="text-neutral-600">No categories yet</p>
            <button
              onclick={() => { closeManageCategoriesModal(); openAddCategoryModal(); }}
              class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Add First Category
            </button>
          </div>
        {:else}
          <ul class="space-y-2 max-h-80 overflow-y-auto pr-2">
            {#each categories as category }
              <li class="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-medium text-black">{category.categoryName}</p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    onclick={() => openEditCategoryModal(category)}
                    class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                    title="Edit category"
                    aria-label="Edit {  category.categoryName  }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                    </svg>
                  </button>
                  <button
                    onclick={() => openDeleteCategoryModal(category)}
                    class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
                    title="Delete category"
                    aria-label="Delete {category.categoryName}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}

        <div class="flex gap-3 pt-6 border-t border-neutral-200 mt-6">
          <button
            type="button"
            onclick={closeManageCategoriesModal}
            class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Close
          </button>
          <button
            type="button"
            onclick={() => { closeManageCategoriesModal(); openAddCategoryModal(); }}
            class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  </div>