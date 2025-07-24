<template>
  <div id="app">
    <header class="app-header">
      <h1>基於 AI 與區塊鏈的未來投票系統</h1>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { useCandidatesStore } from './store/candidates';
import { onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const candidatesStore = useCandidatesStore();

    // When the app component is mounted, initialize the store from localStorage
    // and set up the cross-tab listener.
    onMounted(() => {
      candidatesStore.initializeFromStorage();
    });
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

main {
  padding: 20px;
}
</style>
