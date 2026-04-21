<script lang="ts">
  interface Props {
    draftNote: string;
    onSave: () => void;
    onClose: () => void;
  }
  // draftNote is bindable so the parent keeps it in sync
  let { draftNote = $bindable(), onSave, onClose }: Props = $props();
</script>

<div
  class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="note-modal-title"
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="bg-white rounded-[20px] w-full max-w-[340px] shadow-2xl p-5 animate-slide-up"
    role="document"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <h3 id="note-modal-title" class="text-[18px] font-bold text-[#0A0A0A] mb-3">Order Note</h3>

    <textarea
      bind:value={draftNote}
      placeholder="Add special instructions or comments..."
      aria-label="Order note"
      class="w-full h-32 p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] resize-none outline-none
             focus:border-zinc-400 text-[14px] text-[#0A0A0A] mb-4 custom-scrollbar"
    ></textarea>

    <div class="flex gap-2">
      <button
        onclick={onClose}
        class="flex-1 py-2.5 rounded-[12px] border border-zinc-200 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onclick={onSave}
        class="flex-1 py-2.5 rounded-[12px] bg-[#0A0A0A] text-white text-[14px] font-semibold hover:opacity-80 active:scale-95 transition-all"
      >
        Save Note
      </button>
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
  .animate-slide-up {
    animation: slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
</style>