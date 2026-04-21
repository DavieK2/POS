<script lang="ts">
  interface Props {
    message: string;
  }
  let { message }: Props = $props();
</script>

{#if message}
  <div class="toast-container">
    <div class="toast-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  </div>
{/if}

<style>
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
    from { opacity: 0; transform: translateY(-8px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>