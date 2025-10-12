<template>
  <div class="ai-chat-container">
    <div class="messages-area">
      <div v-for="(message, index) in chatStore.messages" :key="index" class="message" :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }">
        <p>{{ message.text }}</p>
      </div>
      <div v-if="chatStore.isLoading" class="message ai-message">
        <p>AI 正在思考中...</p>
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="在這裡輸入您想問的問題..." :disabled="chatStore.isLoading" />
      <button @click="sendMessage" :disabled="chatStore.isLoading">傳送</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAiChatStore } from '@/store/aiChat';

export default {
  name: 'AiChat',
  setup() {
    const chatStore = useAiChatStore();
    const newMessage = ref('');

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        chatStore.sendMessage(newMessage.value);
        newMessage.value = '';
      }
    };

    return {
      chatStore,
      newMessage,
      sendMessage,
    };
  },
};
</script>

<style scoped>
.ai-chat-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 400px;
  background-color: #fff;
}

.messages-area {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 18px;
  max-width: 80%;
  line-height: 1.4;
}

.user-message {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  margin-left: auto;
}

.ai-message {
  background-color: #f1f1f1;
  color: black;
  align-self: flex-start;
}

.input-area {
  display: flex;
}

.input-area input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-area button {
  margin-left: 8px;
  padding: 8px 12px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}
</style>
