<template>
  <div class="auth-callback">
    <p v-if="user">歡迎，{{ user.name }}！正在驗證您的身份...</p>
    <p v-else>正在處理登入...</p>
    <p v-if="error" class="error-message">登入失敗：{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import axios from 'axios';

const user = ref(null);
const error = ref(null);
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const email = params.get('email');
  const photo = params.get('photo');
  const redirectPath = params.get('redirect');

  if (name && email) {
    const userData = { name, email, photo };
    user.value = userData;

    try {
      // After getting user data, check for admin status
      const response = await axios.get(`http://localhost:3000/api/auth/check-admin?email=${email}`);
      const isAdmin = response.data.isAdmin;

      // Set user data and admin status in the store
      userStore.setUser(userData, isAdmin);

      // Redirect after a short delay
      setTimeout(() => {
        router.push(redirectPath || '/');
      }, 1000);

    } catch (e) {
      console.error("Admin check failed:", e);
      error.value = '無法驗證管理員身份，將以一般使用者身份登入。';
      // Still log the user in, but as a non-admin
      userStore.setUser(userData, false);
      setTimeout(() => {
        router.push(redirectPath || '/');
      }, 2000);
    }
  } else {
    error.value = '未收到使用者資訊。';
  }
});
</script>

<style scoped>
.auth-callback {
  text-align: center;
  padding: 50px;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
