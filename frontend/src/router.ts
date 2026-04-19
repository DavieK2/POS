import type { Component } from 'svelte';
import POS from "./pos/POS.svelte"
import Login from "./auth/Login.svelte"
import DashboardPage from "./admin/pages/DashboardPage.svelte"
import SalesPage from "./admin/pages/SalesPage.svelte"
import InventoryPage from "./admin/pages/InventoryPage.svelte"
import SettingsPage from './admin/pages/SettingsPage.svelte';
import UsersPage from './admin/pages/UsersPage.svelte';

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