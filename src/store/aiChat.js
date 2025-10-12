import { defineStore } from 'pinia';
import axios from 'axios';

export const useAiChatStore = defineStore('aiChat', {
  state: () => ({
    messages: [],
    isLoading: false,
  }),
  actions: {
    async sendMessage(question) {
      if (!question.trim()) return;

      this.isLoading = true;
      this.messages.push({
        text: question,
        isUser: true,
      });

      try {
        const response = await axios.post('http://localhost:3000/api/ai/chat', { question });
        this.messages.push({
          text: response.data.answer,
          isUser: false,
        });
      } catch (error) {
        console.error('Error sending message to AI:', error);
        this.messages.push({
          text: '糟糕，AI 似乎出了點問題，請稍後再試。',
          isUser: false,
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
