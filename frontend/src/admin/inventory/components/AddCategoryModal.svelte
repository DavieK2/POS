<script lang="ts">
  import { showToast } from "../../../lib/toast";
  import Button from "../../../shared/button.svelte";
  import { api, BASE_URL } from "../../../utils";

  let {
    closeAddCategoryModal,
    openManageCategoriesModal,
    onCategoryAdded,
  }: {
    closeAddCategoryModal: () => void;
    openManageCategoriesModal: () => void;
    onCategoryAdded: (e: { message: string }) => void;
  } = $props();

  let imagePreview = $state<string | null>(null);
  let isDragging = $state(false);
  let fileInput: HTMLInputElement;
  let categoryName = $state("");
  let categoryImage = $state("");
  let isLoading = $state(false)

   function handleImageFile(file: File) {
    if ( !file.type.startsWith("image/") ) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      categoryImage = base64;
      imagePreview = base64;
    };
    reader.readAsDataURL(file);
  }

  function handleImageChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleImageFile(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file);
  }

  function clearImage() {
    imagePreview = null;
    categoryImage = "";
    fileInput.value = "";
  }

  const handleAddCategory = async (e: Event): Promise<void> => {

    isLoading = true;
    e.preventDefault();


    await api({
        url: '/category',
        method: "POST",
        body: { categoryName, categoryImage },
        onFail: (data) => showToast(data.message),
        onSuccess: (data) =>  onCategoryAdded({ message: data.message })
    });

    isLoading = false;
    
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
        <label for="product-image" class="block text-sm font-medium text-neutral-700 mb-1">Category Image</label>

        {#if imagePreview}
          <div class="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 h-44">
            <img
              src={imagePreview}
              alt="Product preview"
              class="w-full h-full object-contain"
            />
            <button
              type="button"
              onclick={clearImage}
              class="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg transition-colors"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        {:else}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="relative flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed transition-colors cursor-pointer
              {isDragging ? 'border-black bg-neutral-100' : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'}"
            onclick={() => fileInput.click()}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); }}
            ondragover={(e) => { e.preventDefault(); isDragging = true; }}
            ondragleave={() => isDragging = false}
            ondrop={handleDrop}
            role="button"
            tabindex="0"
            aria-label="Upload product image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-neutral-400 mb-2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <p class="text-sm font-medium text-neutral-600">Click or drag to upload</p>
            <p class="text-xs text-neutral-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
          </div>
        {/if}

        <input
          id="product-image"
          bind:this={fileInput}
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleImageChange}
        />
      </div>

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
        <Button label="Add Category" loading={isLoading} />
      </div>
    </form>
  </div>
</div>
