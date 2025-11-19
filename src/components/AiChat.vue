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
    <form class="input-area" @submit.prevent="sendMessage">
      <textarea
        v-model="newMessage"
        @keydown.enter="handleEnter"
        placeholder="在這裡輸入您想問的問題..."
        :disabled="chatStore.isLoading"
        rows="1"
        ref="textarea"
      ></textarea>
      <button type="submit" :disabled="chatStore.isLoading">傳送</button>
    </form>
  </div>
</template>

<script>
import { ref, nextTick, watch } from 'vue';
import { useAiChatStore } from '@/store/aiChat';

export default {
  name: 'AiChat',
  setup() {
    const chatStore = useAiChatStore();
    const newMessage = ref('');
    const textarea = ref(null);

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        chatStore.sendMessage(newMessage.value);
        newMessage.value = '';
      }
    };

    const handleEnter = (e) => {
      if (e.isComposing) {
        return;
      }
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    watch(newMessage, async () => {
      await nextTick();
      if (textarea.value) {
        textarea.value.style.height = 'auto';
        textarea.value.style.height = `${textarea.value.scrollHeight}px`;
      }
    });

    return {
      chatStore,
      newMessage,
      sendMessage,
      handleEnter,
      textarea,
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

.input-area textarea {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
  overflow-y: auto;
  max-height: 100px;
  transition: height 0.2s ease;
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
