<script>
  import Layout from "../../layouts/Layout.svelte";

</script>

<Layout>
  <div class="flex-1 overflow-auto bg-neutral-50/30">
    <div class="p-4 md:p-8 max-w-7xl mx-auto fade-in">
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-black mb-1">Settings</h1>
        <p class="text-neutral-500 text-sm">Manage your hardware preferences and account security</p>
      </div>

      <div class="space-y-6">
        <section class="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"></path>
                <rect x="6" y="14" width="12" height="8" rx="1"></rect>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-black">Printer Settings</h2>
              <p class="text-xs text-neutral-500">Choose the default device for receipts and reports</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="barcode" class="text-sm font-semibold text-neutral-700">Barcode Printer</label>
                <select id="barcode" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black bg-white transition-all">
                  <option value="p-01">HP LaserJet Pro M404n (Network)</option>
                  <option value="p-02">Epson TM-T88VI (Thermal Receipt)</option>
                  <option value="p-03">Microsoft Print to PDF</option>
                  <option value="p-04">Warehouse-Label-Printer</option>
                </select>
              </div>
              <div class="flex items-end">
                <button class="w-full md:w-auto px-6 py-2.5 bg-neutral-100 text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors border border-neutral-200"> Test Print </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="receipt" class="text-sm font-semibold text-neutral-700">Receipt Printer</label>
                <select id="receipt" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black bg-white transition-all">
                  <option value="p-01">HP LaserJet Pro M404n (Network)</option>
                  <option value="p-02">Epson TM-T88VI (Thermal Receipt)</option>
                  <option value="p-03">Microsoft Print to PDF</option>
                  <option value="p-04">Warehouse-Label-Printer</option>
                </select>
              </div>
              <div class="flex items-end">
                <button class="w-full md:w-auto px-6 py-2.5 bg-neutral-100 text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors border border-neutral-200"> Test Print </button>
              </div>
            </div>

            <label class="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 bg-neutral-50/50 cursor-pointer group">
              <input type="checkbox" class="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black" checked />
              <span class="text-sm text-neutral-600 group-hover:text-black transition-colors">Auto-print receipt after every transaction</span>
            </label>
          </div>
        </section>

        <section class="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-black">Security</h2>
              <p class="text-xs text-neutral-500">Update your password to keep your account secure</p>
            </div>
          </div>

          <form class="max-w-md space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-semibold text-neutral-700">Current Password</label>
              <input type="password" placeholder="••••••••" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-neutral-700">New Password</label>
              <input type="password" placeholder="Minimum 8 characters" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-neutral-700">Confirm New Password</label>
              <input type="password" placeholder="Re-type new password" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all" />
            </div>

            <div class="pt-2 flex flex-col sm:flex-row gap-3">
              <button type="submit" class="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors shadow-sm focus:ring-2 focus:ring-neutral-400"> Update Password </button>
              <button type="button" class="px-6 py-2.5 text-neutral-500 font-medium hover:text-black transition-colors"> Cancel </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</Layout>
