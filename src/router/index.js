import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import UploadPage from '../views/UploadPage.vue';
import ResultPage from '../views/ResultPage.vue';

import AuthCallback from '../views/AuthCallback.vue'; // 導入 AuthCallback 組件

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/upload',
    name: 'Upload',
    component: UploadPage
  },
  {
    path: '/result',
    name: 'Result',
    component: ResultPage
  },
  {
    path: '/auth/callback', // 新增的路由
    name: 'AuthCallback',
    component: AuthCallback
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;