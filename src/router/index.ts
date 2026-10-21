/**
 * @file router.ts
 * Configures the Vue Router instance, defines application routes and HTML5 history mode.
 */
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

/** Vue Router instance containing all application route mappings. */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
  ],
})

export default router
