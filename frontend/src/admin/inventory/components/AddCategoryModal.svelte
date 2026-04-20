<script lang="ts">
  import { showToast } from "../../../lib/toast";
  import { BASE_URL } from "../../../utils";

  let {
    closeAddCategoryModal,
    openManageCategoriesModal,
    onCategoryAdded,
  }: {
    closeAddCategoryModal: () => void;
    openManageCategoriesModal: () => void;
    onCategoryAdded: (e: { message: string }) => void;
  } = $props();

  let categoryName = $state("");

  const handleAddCategory = async (e: Event): Promise<void> => {
    e.preventDefault();


    const req = await fetch(`${BASE_URL}/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryName: categoryName }),
    });

    if (!req.ok) {
      const res = await req.json();
      console.log(res);
      showToast(res.message)
      return;
    }

    const res = await req.json();
    onCategoryAdded({ message: res.message })
    // await getCategories();

    // closeAddCategoryModal();
    // openManageCategoriesModal();
  };
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
  onclick={closeAddCategoryModal}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") closeAddCategoryModal();
  }}
  aria-hidden="true"
>
  <div class="bg-white rounded-2xl shadow-2xl max-h-[95vh] w-full max-w-md overflow-hidden animate-scale-in" role="dialog" aria-modal="true" aria-labelledby="add-category-title" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
      <h2 id="add-category-title" class="text-lg font-semibold text-black">Add New Category</h2>
      <button onclick={closeAddCategoryModal} class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Close modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form onsubmit={handleAddCategory} class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
      <div>
        <label for="new-category" class="block text-sm font-medium text-neutral-700 mb-1">Category Name *</label>
        <input id="new-category" type="text" bind:value={categoryName} required placeholder="e.g., Accessories" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
      </div>

      <div class="flex gap-3 pt-4">
        <button
          type="button"
          onclick={() => {
            closeAddCategoryModal();
            openManageCategoriesModal();
          }}
          class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"
        >
          Cancel
        </button>
        <button type="submit" class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Add Category </button>
      </div>
    </form>
  </div>
</div>
