<script lang="ts">
  import type { Category } from "../../../shared/types";


  let { 
    categories, 
    closeManageCategoriesModal, 
    openAddCategoryModal, 
    openEditCategoryModal, 
    openDeleteCategoryModal 
  }: {
    categories: Category[];
    closeManageCategoriesModal: () => void;
    openAddCategoryModal: () => void;
    openEditCategoryModal: (category: Category) => void;
    openDeleteCategoryModal: (category: Category) => void;
  } = $props();
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md animate-fade-in"
>
  <div
    class="bg-white rounded-2xl shadow-[0_16px_40px_rgb(0,0,0,0.12)] w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[95vh]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="manage-categories-title"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
      <div>
        <h2 id="manage-categories-title" class="text-xl font-semibold text-gray-900 tracking-tight">Categories</h2>
        <p class="text-sm text-gray-500 mt-1">Manage, edit, and organize your categories.</p>
      </div>
      <button
        onclick={closeManageCategoriesModal}
        class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none -mr-2"
        aria-label="Close modal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
      {#if categories.length === 0}
        <div class="text-center py-12 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-900 mb-1">No categories found</h3>
          <p class="text-sm text-gray-500 mb-4">Get started by creating your first category.</p>
          <button
            onclick={() => { closeManageCategoriesModal(); openAddCategoryModal(); }}
            class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black transition-colors font-medium shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Category
          </button>
        </div>
      {:else}
        <div class="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-200">
                <th scope="col" class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th scope="col" class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {#each categories as category}
                <tr class="hover:bg-gray-50/60 transition-colors group">
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <span class="font-medium text-gray-900">{category.categoryName}</span>
                  </td>
                  <td class="px-5 py-3.5 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        onclick={() => openEditCategoryModal(category)}
                        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all focus:ring-2 focus:ring-blue-100 focus:outline-none"
                        title="Edit category"
                        aria-label="Edit {category.categoryName}"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                        </svg>
                      </button>
                      <button
                        onclick={() => openDeleteCategoryModal(category)}
                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all focus:ring-2 focus:ring-red-100 focus:outline-none"
                        title="Delete category"
                        aria-label="Delete {category.categoryName}"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      {/if}
    </div>

    <div class="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
      <button
        type="button"
        onclick={closeManageCategoriesModal}
        class="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm shadow-sm focus:ring-2 focus:ring-gray-200 focus:outline-none"
      >
        Close
      </button>
      <button
        type="button"
        onclick={() => { closeManageCategoriesModal(); openAddCategoryModal(); }}
        class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium text-sm shadow-sm focus:ring-2 focus:ring-gray-400 focus:outline-none flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        New Category
      </button>
    </div>
  </div>
</div>