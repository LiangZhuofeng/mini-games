import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/admin.html'), // Base for admin MPA
  routes: [
    {
      path: '/',
      component: () => import('../admin/layout/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../admin/views/DashboardView.vue'),
        },
        {
          path: 'records',
          name: 'GameRecords',
          component: () => import('../admin/views/RecordsView.vue'),
        },
      ],
    },
  ],
})

export default router
