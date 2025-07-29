<template>
  <div id="app">
    <header class="app-header">
      <h1>投票網站</h1>
      <nav>
        <a v-if="!userStore.isLoggedIn" :href="backendAuthUrl" class="login-button">Login with Google</a>
        <button v-else @click="logout" class="logout-button">Logout</button>
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

export default {
  name: 'App',
  setup() {
    const candidatesStore = useCandidatesStore();
    const userStore = useUserStore();

    onMounted(() => {
      candidatesStore.initializeFromStorage();
      userStore.initializeFromStorage();
    });

    const logout = () => {
      userStore.clearUser();
    };

    return {
      userStore: computed(() => userStore),
      backendAuthUrl: 'http://localhost:3000/auth/google',
      logout
    };
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.8em;
}

.app-header nav {
  margin-top: 10px;
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
