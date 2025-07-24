<template>
  <div class="home-container">
    <div class="candidates-section">
      <h2>候選人列表</h2>
      <div v-for="candidate in candidatesStore.candidates" :key="candidate.id" class="candidate-card">
        <h3>{{ candidate.name }}</h3>
        <p class="platform"><strong>政見：</strong>{{ candidate.platform }}</p>
        <div class="vote-action">
          <button @click="handleVote(candidate.id)" class="vote-button">投給他</button>
        </div>
      </div>
    </div>

    <div class="chat-section">
      <h2>AI 政見分析</h2>
      <div class="chat-window">
        <div class="chat-message ai">
          你好！我是 AI 投票助理，請問你想了解哪位候選人的什麼政見？
        </div>
        <!-- 聊天訊息將會動態新增於此 -->
      </div>
      <div class="chat-input">
        <input type="text" placeholder="輸入你的問題..." />
        <button>傳送</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCandidatesStore } from '../store/candidates';

export default {
  name: 'HomePage',
  setup() {
    const candidatesStore = useCandidatesStore();

    const handleVote = (candidateId) => {
      candidatesStore.vote(candidateId);
      alert(`感謝您的投票！`);
    };

    return {
      candidatesStore,
      handleVote
    };
  }
};
</script>

<style scoped>
.home-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: auto;
}

.candidates-section, .chat-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.candidates-section {
  flex: 3;
}

.chat-section {
  flex: 2;
  display: flex;
  flex-direction: column;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.candidate-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: box-shadow 0.2s;
}

.candidate-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.platform {
  color: #555;
  line-height: 1.6;
}

.vote-action {
  display: flex;
  justify-content: flex-end; /* Align button to the right */
  align-items: center;
  margin-top: 15px;
}

.vote-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.vote-button:hover {
  background-color: #218838;
}

/* Chat Section Styles */
.chat-window {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  margin-bottom: 15px;
  min-height: 300px;
}

.chat-message {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  max-width: 80%;
}

.chat-message.ai {
  background-color: #eef5ff;
  align-self: flex-start;
}

.chat-input {
  display: flex;
}

.chat-input input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  padding: 10px;
  font-size: 1em;
}

.chat-input button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
}
</style>
