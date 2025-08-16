import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useUserStore } from './store/user' // 導入 user store

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// 在掛載應用前，從 localStorage 初始化使用者狀態
const userStore = useUserStore()
userStore.initializeFromStorage()

app.use(router)
app.mount('#app')
