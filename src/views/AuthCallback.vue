<template>
  <div class="auth-callback">
    <p v-if="user">歡迎，{{ user.name }}！您已成功登入。</p>
    <p v-else>正在處理登入...</p>
    <p v-if="error" class="error-message">登入失敗：{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user'; // 導入 user store

export default {
  name: 'AuthCallback',
  setup() {
    const user = ref(null);
    const error = ref(null);
    const router = useRouter();
    const userStore = useUserStore(); // 使用 user store

    onMounted(() => {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      const email = params.get('email');
      const photo = params.get('photo');

      if (name && email) {
        const userData = { name, email, photo };
        user.value = userData;
        userStore.setUser(userData); // 將使用者資訊儲存到 user store

        // 登入成功後，可以重定向到首頁或其他頁面
        setTimeout(() => {
          router.push('/');
        }, 2000); // 2秒後重定向
      } else {
        error.value = '未收到使用者資訊。';
      }
    });

    return {
      user,
      error
    };
  }
};
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