import type { Component } from 'svelte';
import POS from "./pos/main/POS.svelte"
import Login from "./auth/Login.svelte"
import DashboardPage from "./admin/dashboard/main/DashboardPage.svelte"
import SalesPage from "./admin/sales/main/SalesPage.svelte"
import InventoryPage from "./admin/inventory/main/InventoryPage.svelte"
import SettingsPage from './admin/settings/main/SettingsPage.svelte';
import UsersPage from './admin/users/main/UsersPage.svelte';

export interface AppRoute {
  path: string;
  component: Component<any> | (() => Promise<{ default: Component<any> }>);
  props?: Record<string, any>;
  hooks?: Record<string, any>,
  metadata?: {
    title: string;
  };
}

export const routes: AppRoute[] = [
  {
    path: '/pos',
    component: POS
  },
  {
    path: '/',
    component: Login
  },
  {
    path: '/dashboard',
    component: DashboardPage
  },
  {
    path: '/inventory',
    component: InventoryPage
  },
  {
    path: '/sales',
    component: SalesPage
  },
  {
    path: '/settings',
    component: SettingsPage
  },
  {
    path: '/users',
    component: UsersPage
  }
];