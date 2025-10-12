<template>
  <div class="login-view">
    <p>正在將您導向至登入頁面...</p>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'LoginView',
  setup() {
    const route = useRoute();

    onMounted(() => {
      const redirectPath = route.query.redirect || '/';
      const backendAuthUrl = `http://localhost:3000/auth/google?state=${encodeURIComponent(redirectPath)}`;
      window.location.href = backendAuthUrl;
    });

    return {};
  }
};
</script>

<style scoped>
.login-view {
  text-align: center;
  padding: 50px;
  font-family: sans-serif;
}
</style>
