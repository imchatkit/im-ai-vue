import { createRouter, createWebHashHistory } from 'vue-router';
import { ApiService } from '../modules/http-client';

// 路由配置
const routes = [
  {
    path: '/',
    name: 'MainLayout',
    component: () => import('../views/MainLayout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = ApiService.isLoggedIn();
  
  // 需要登录但未登录，跳转到登录页
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next('/login');
  } 
  // 已登录用户访问登录页，跳转到首页
  else if (to.matched.some(record => record.meta.guest) && isLoggedIn) {
    next('/');
  } 
  // 正常导航
  else {
    next();
  }
});

export default router; 