<template>
  <div id="app">
    <header class="app-header">
      <router-link to="/" class="header-title-link"><h1>投票網站</h1></router-link>
      <nav>
        <nav>
        <!-- Login/Logout Button -->
        <a v-if="!userStore.isLoggedIn" :href="backendAuthUrl" class="login-button">一般使用者登入</a>
        <button v-else @click="logout" class="logout-button">Logout</button>

        <!-- Admin Portal Link -->
        <router-link to="/admin" class="admin-link">管理員入口</router-link>
      </nav>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { useCandidatesStore } from './store/candidates';
import { useUserStore } from './store/user';
import { onMounted } from 'vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router'; // 導入 useRouter

export default {
  name: 'App',
  setup() {
    const candidatesStore = useCandidatesStore();
    const userStore = useUserStore();
    const router = useRouter(); // 獲取 router 實例

    onMounted(() => {
      candidatesStore.fetchCandidates(); // 從後端獲取候選人數據
      userStore.initializeFromStorage();
    });

    const logout = () => {
      userStore.clearUser();
      router.push('/'); // 登出後導向首頁
    };

    return {
      userStore: computed(() => userStore),
      backendAuthUrl: 'http://localhost:3000/auth/google', // 後端認證URL
      logout
    };
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: 'Noto Sans TC', sans-serif;
  background-color: #f4f4f9;
}

#app {
  color: #2c3e50;
}

.app-header {
  background-color: #007bff;
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.app-header h1 {
  margin: 0;
  font-size: 1.8em;
}

.header-title-link,
.header-title-link:hover,
.header-title-link:visited {
  color: inherit; /* 繼承父層的顏色 (白色) */
  text-decoration: none; /* 移除底線 */
}

.app-header nav {
  margin-top: 10px;
  display: flex; /* 使用 Flexbox 來排版 */
  justify-content: flex-end; /* 靠右對齊 */
  align-items: center; /* 垂直置中 */
  gap: 15px; /* 按鈕之間的間距 */
}

.admin-link {
  background-color: #6c757d;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.admin-link:hover {
  background-color: #5a6268;
}

.login-button {
  display: inline-block;
  background-color: #ffffff;
  color: #007bff;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  margin-right: 15px; /* 和管理員入口按鈕的間距 */
}

.login-button:hover {
  background-color: #e0e0e0;
}

.logout-button {
  display: inline-block;
  background-color: #dc3545; /* A red color for logout */
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c82333; /* A darker red on hover */
}

main {
  padding: 20px;
}
</style>
