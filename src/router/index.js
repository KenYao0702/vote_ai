import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import UploadPage from '../views/UploadPage.vue';
import ResultPage from '../views/ResultPage.vue';
import AdminView from '../views/AdminView.vue'; // 導入 AdminView 組件
import AuthCallback from '../views/AuthCallback.vue'; // 導入 AuthCallback 組件
import LoginView from '../views/LoginView.vue'; // 導入 LoginView 組件
import { useUserStore } from '../store/user'; // 導入 user store
import axios from 'axios'; // 導入 axios

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
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true } // 新增 meta 資訊
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // 如果目標是回調頁面或登入頁，無條件放行
  if (to.name === 'AuthCallback' || to.name === 'Login') {
    return next();
  }

  const userStore = useUserStore();
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (!requiresAdmin) {
    // 目標路由不需要管理員權限，直接放行
    return next();
  }

  // --- 以下是 /admin 路由的邏輯 ---
  if (userStore.isLoggedIn) {
    // 使用者已登入，檢查管理員權限
    try {
      const response = await axios.get(`http://localhost:3000/api/auth/check-admin?email=${userStore.user.email}`);
      if (response.data.isAdmin) {
        // IMPORTANT: Update the store with the confirmed admin status
        userStore.setUser(userStore.user, true);
        next(); // Is admin, proceed
      } else {
        alert('此帳號權限不足，將導向首頁。');
        next({ name: 'Home' }); // Not an admin, redirect to home
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      alert('驗證管理員身份時發生錯誤。');
      next({ name: 'Home' });
    }
  } else {
    // 使用者未登入，導向到登入頁，並附上原始意圖路徑
    alert('此頁面需要管理員權限，將為您導向登入頁面。');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  }
});

export default router;