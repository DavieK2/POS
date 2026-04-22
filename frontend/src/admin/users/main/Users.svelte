<script lang="ts">
  import Layout from "../../layouts/Layout.svelte";

  

  type UserRole = "Admin" | "Manager" | "Staff" | "Viewer";
  type UserStatus = "Active" | "Inactive";

  interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastActive: string;
  }

  interface FormData {
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    password: string;
  }

  // Svelte 5 runes for state management with TypeScript
  let addModalOpen = $state<boolean>(false);
  let editModalOpen = $state<boolean>(false);
  let deleteModalOpen = $state<boolean>(false);

  // Form state for add/edit
  let formData = $state<FormData>({
    name: "",
    email: "",
    role: "Viewer",
    status: "Active",
    password: "",
  });

  // User being edited/deleted
  let currentUser = $state<User | null>(null);

  // Available roles (typed array)
  const roles: UserRole[] = ["Admin", "Manager", "Staff", "Viewer"];

  // Sample users data (replace with your actual data store)
  let users = $state<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", lastActive: "2 min ago" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "Manager", status: "Active", lastActive: "1 hour ago" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Staff", status: "Inactive", lastActive: "3 days ago" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", role: "Viewer", status: "Active", lastActive: "5 min ago" },
  ]);

  // Open modals
  function openAddModal(): void {
    formData = { name: "", email: "", role: "Viewer", status: "Active", password: "" };
    addModalOpen = true;
  }

  function openEditModal(user: User): void {
    currentUser = user;
    formData = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
    };
    editModalOpen = true;
  }

  function openDeleteModal(user: User): void {
    currentUser = user;
    deleteModalOpen = true;
  }

  // Close modals
  function closeAddModal(): void {
    addModalOpen = false;
  }
  function closeEditModal(): void {
    editModalOpen = false;
  }
  function closeDeleteModal(): void {
    deleteModalOpen = false;
  }

  // Handle form submission for add
  function handleAddUser(e: SubmitEvent): void {
    e.preventDefault();
    const newUser: User = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      lastActive: "Just now",
    };
    users.push(newUser);
    closeAddModal();
    // TODO: Add API call here
  }

  // Handle form submission for edit
  function handleEditUser(e: SubmitEvent): void {
    e.preventDefault();
    if (!currentUser) return;

    const index = users.findIndex((u) => u.id === currentUser?.id);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };
    }
    closeEditModal();
    // TODO: Add API call here
  }

  // Handle delete confirmation
  function handleDeleteUser(): void {
    if (!currentUser) return;
    users = users.filter((u) => u.id !== currentUser?.id);
    closeDeleteModal();
    // TODO: Add API call here
  }

  // Get role badge styles (pure function with typed input/output)
  function getRoleStyles(role: UserRole): string {
    const styles: Record<UserRole, string> = {
      Admin: "bg-purple-100 text-purple-700 border-purple-200",
      Manager: "bg-blue-100 text-blue-700 border-blue-200",
      Staff: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Viewer: "bg-neutral-100 text-neutral-700 border-neutral-200",
    };
    return styles[role];
  }

  // Get status badge styles
  function getStatusStyles(status: UserStatus): string {
    return status === "Active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-neutral-500 border-neutral-200";
  }

  // Close modal on Escape key
  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      if (addModalOpen) closeAddModal();
      if (editModalOpen) closeEditModal();
      if (deleteModalOpen) closeDeleteModal();
    }
  }

  // Prevent background scroll when modal is open
  $effect(() => {
    if (addModalOpen || editModalOpen || deleteModalOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeydown);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  });
</script>

<Layout>
  <div class="p-4 md:p-8 max-w-7xl mx-auto fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-xl md:text-xl font-bold text-black mb-1">User Management</h1>
        <p class="text-neutral-500 text-sm">Manage team members and their access permissions</p>
      </div>
      <button onclick={openAddModal} class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-sm focus:ring-2 focus:ring-neutral-400 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path d="M5 12h14" /><path d="M12 5v14" />
        </svg>
        <span class="font-medium">Add User</span>
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div class="text-xs text-neutral-500">Total Users</div>
            <div class="text-xl font-bold text-black">{users.length}</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div class="text-xs text-neutral-500">Active Users</div>
            <div class="text-xl font-bold text-black">{users.filter((u) => u.status === "Active").length}</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div class="text-xs text-neutral-500">Admins</div>
            <div class="text-xl font-bold text-black">{users.filter((u) => u.role === "Admin").length}</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M1 12h4M19 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div>
            <div class="text-xs text-neutral-500">Pending Invites</div>
            <div class="text-xl font-bold text-black">2</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Search users..." class="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" aria-label="Search users" />
      </div>
      <select class="px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white min-w-[180px]">
        <option value="all">All Roles</option>
        {#each roles as role}
          <option value={role}>{role}</option>
        {/each}
      </select>
      <select class="px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white min-w-[180px]">
        <option value="all">All Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>

    <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-175">
          <thead class="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">User</th>
              <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Role</th>
              <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
              <th scope="col" class="text-left px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden md:table-cell">Last Active</th>
              <th scope="col" class="text-right px-4 md:px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            {#each users as user (user.id)}
              <tr class="table-row transition-colors hover:bg-neutral-50/50">
                <td class="px-4 md:px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-medium text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div class="font-medium text-sm text-black">{user.name}</div>
                      <div class="text-xs text-neutral-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border {getRoleStyles(user.role)}">
                    {user.role}
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border {getStatusStyles(user.status)}">
                    <span class="w-1.5 h-1.5 rounded-full {user.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'}"></span>
                    {user.status}
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4 text-neutral-500 hidden md:table-cell">{user.lastActive}</td>
                <td class="px-4 md:px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <button onclick={() => openEditModal(user)} class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" title="Edit" aria-label="Edit {user.name}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                      </svg>
                    </button>
                    <button onclick={() => openDeleteModal(user)} class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none" title="Delete" aria-label="Delete {user.name}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
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
        <div class="text-neutral-500">Showing <span class="font-medium text-black">1-10</span> of <span class="font-medium text-black">{users.length}</span> users</div>
        <div class="flex items-center gap-1.5">
          <button class="px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-neutral-400 focus:outline-none" disabled aria-label="Previous page">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button class="px-3 py-1.5 bg-black text-white rounded-lg font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-current="page">1</button>
          <button class="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-black transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none">2</button>
          <button class="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-black transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Next page">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add User Modal -->
  {#if addModalOpen}
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onclick={closeAddModal} role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in" >
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="add-modal-title" class="text-lg font-semibold text-black">Add New User</h2>
          <button onclick={closeAddModal} class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onsubmit={handleAddUser} class="p-6 space-y-4">
          <div>
            <label for="add-name" class="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
            <input id="add-name" type="text" bind:value={formData.name} required placeholder="e.g., John Doe" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
          </div>

          <div>
            <label for="add-email" class="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
            <input id="add-email" type="email" bind:value={formData.email} required placeholder="e.g., john@example.com" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
          </div>

          <div>
            <label for="add-password" class="block text-sm font-medium text-neutral-700 mb-1">Password *</label>
            <input id="add-password" type="password" bind:value={formData.password} required minlength="8" placeholder="••••••••" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
            <p class="text-xs text-neutral-500 mt-1">Minimum 8 characters</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="add-role" class="block text-sm font-medium text-neutral-700 mb-1">Role *</label>
              <select id="add-role" bind:value={formData.role} class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white">
                {#each roles as role}
                  <option value={role}>{role}</option>
                {/each}
              </select>
            </div>
            <div>
              <label for="add-status" class="block text-sm font-medium text-neutral-700 mb-1">Status *</label>
              <select id="add-status" bind:value={formData.status} class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" onclick={closeAddModal} class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Cancel </button>
            <button type="submit" class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Invite User </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Edit User Modal -->
  {#if editModalOpen}
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onclick={closeEditModal} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 id="edit-modal-title" class="text-lg font-semibold text-black">Edit User</h2>
          <button onclick={closeEditModal} class="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors focus:ring-2 focus:ring-neutral-400 focus:outline-none" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onsubmit={handleEditUser} class="p-6 space-y-4">
          <div>
            <label for="edit-name" class="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
            <input id="edit-name" type="text" bind:value={formData.name} required placeholder="e.g., John Doe" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
          </div>

          <div>
            <label for="edit-email" class="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
            <input id="edit-email" type="email" bind:value={formData.email} required placeholder="e.g., john@example.com" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="edit-role" class="block text-sm font-medium text-neutral-700 mb-1">Role *</label>
              <select id="edit-role" bind:value={formData.role} class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white">
                {#each roles as role}
                  <option value={role}>{role}</option>
                {/each}
              </select>
            </div>
            <div>
              <label for="edit-status" class="block text-sm font-medium text-neutral-700 mb-1">Status *</label>
              <select id="edit-status" bind:value={formData.status} class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="pt-2">
            <label for="edit-password" class="block text-sm font-medium text-neutral-700 mb-1">New Password <span class="text-neutral-400 font-normal">(optional)</span></label>
            <input id="edit-password" type="password" bind:value={formData.password} minlength="8" placeholder="Leave blank to keep current" class="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-black transition-all bg-white" />
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" onclick={closeEditModal} class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Cancel </button>
            <button type="submit" class="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Save Changes </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if deleteModalOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onclick={closeDeleteModal} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h2 id="delete-modal-title" class="text-lg font-semibold text-black">Confirm Delete</h2>
        </div>

        <div class="p-6">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </div>
            <div>
              <p class="text-neutral-700">Are you sure you want to remove</p>
              <p class="font-semibold text-black">{currentUser?.name} <span class="text-neutral-500 font-normal">({currentUser?.email})</span>?</p>
              <p class="text-sm text-neutral-500 mt-2">This will revoke their access immediately.</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button onclick={closeDeleteModal} class="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium focus:ring-2 focus:ring-neutral-400 focus:outline-none"> Cancel </button>
            <button onclick={handleDeleteUser} class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"> Remove User </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</Layout>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.25s ease-out;
  }
</style>
