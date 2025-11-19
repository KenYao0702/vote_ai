<template>
  <div class="home-container">
    <div class="candidates-section">
      <h2>候選人列表</h2>

      <div v-if="candidatesStore.isVotingNotStarted" class="status-banner info">
        投票尚未開始，請等候管理員開啟。
      </div>
      <div v-if="candidatesStore.isVotingRunning" class="status-banner running">
        投票進行中！剩餘時間：<strong>{{ candidatesStore.remainingTime }}</strong>
      </div>
      <div v-if="candidatesStore.isVotingEnded" class="status-banner success">
        投票已結束，感謝您的參與！請至結果頁面查看票數。
      </div>

      <div v-for="candidate in candidatesStore.candidates" :key="candidate.id" class="candidate-card">
        <div class="card-header">
          <img v-if="candidate.imageUrl" :src="candidate.imageUrl" alt="Candidate Avatar" class="avatar">
          <h3 class="candidate-name">{{ candidate.name }}</h3>
        </div>

        <div v-if="candidate.videoUrl" class="media-container">
          <iframe :src="candidate.videoUrl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="candidate-video"></iframe>
        </div>

        <p class="platform"><strong>政見：</strong>{{ candidate.platform }}</p>
        <div class="vote-action">
          <button 
            @click="handleVote(candidate.id)" 
            :disabled="!candidatesStore.isVotingRunning"
            class="vote-button"
          >
            <span v-if="candidatesStore.isVotingRunning">投給他</span>
            <span v-if="candidatesStore.isVotingNotStarted">尚未開始</span>
            <span v-if="candidatesStore.isVotingEnded">已結束</span>
          </button>
        </div>
      </div>
    </div>

    <div class="chat-section">
      <h2>AI 政見分析</h2>
      <div class="chat-window">
        <div v-for="(message, index) in aiChatStore.messages" :key="index" class="chat-message" :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }">
          <div v-if="message.isUser">{{ message.text }}</div>
          <div v-else v-html="marked(message.text)"></div>
        </div>
        <div v-if="aiChatStore.isLoading" class="chat-message ai-message">
          小助手正在思考中，請稍候
        </div>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" @keydown="handleKeyDown" type="text" placeholder="輸入你的問題..." :disabled="aiChatStore.isLoading" />
        <button @click="sendMessage" :disabled="aiChatStore.isLoading">傳送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCandidatesStore } from '../store/candidates';
import { useAiChatStore } from '../store/aiChat';
import { marked } from 'marked';

const candidatesStore = useCandidatesStore();
const aiChatStore = useAiChatStore();
const newMessage = ref('');

const handleVote = async (candidateId) => {
  await candidatesStore.vote(candidateId);
};

const sendMessage = () => {
  if (newMessage.value.trim()) {
    aiChatStore.sendMessage(newMessage.value);
    newMessage.value = '';
  }
};

const handleKeyDown = (event) => {
  if (event.key !== 'Enter' || event.isComposing) {
    return;
  }
  event.preventDefault();
  sendMessage();
};

onMounted(() => {
  candidatesStore.fetchCandidates();
  candidatesStore.fetchElectionStatus();
});
</script>

<style scoped>
body {
  background-color: #f4f7f6;
}

.home-container {
  font-family: 'Noto Sans TC', sans-serif;
  display: flex;
  gap: 30px;
  padding: 30px;
  max-width: 1500px;
  margin: auto;
}

.candidates-section, .chat-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
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
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.8em;
  margin-bottom: 25px;
}

.status-banner {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1em;
  font-weight: 500;
}
.info {
  background-color: #eef5ff;
  color: #0050b3;
}
.running {
  background-color: #fffbe6;
  color: #b47700;
}
.success {
  background-color: #f6ffed;
  color: #389e0d;
}

.candidate-card {
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.candidate-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 15px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid #ecf0f1;
  flex-shrink: 0;
}

.candidate-name {
  margin: 0;
  font-size: 1.6em;
  font-weight: 700;
  color: #34495e;
}

.media-container {
  margin: 20px 0;
  text-align: center;
}

.candidate-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  border: none;
}

.platform {
  color: #34495e;
  line-height: 1.7;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 10px;
}

.vote-action {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
}

.vote-button {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: 700;
  font-size: 1em;
}

.vote-button:hover:not(:disabled) {
  background-color: #16a085;
  transform: translateY(-2px);
}

.vote-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* Chat Section Styles */
.chat-window {
  flex-grow: 1;
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  margin-bottom: 20px;
  min-height: 350px;
  max-height: 550px;
  display: flex;
  flex-direction: column;
}

.chat-message {
  padding: 12px 18px;
  border-radius: 18px;
  margin-bottom: 12px;
  max-width: 85%;
  line-height: 1.5;
}

.user-message {
  background-color: #3498db;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.ai-message {
  background-color: #ecf0f1;
  color: #2c3e50;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.chat-input {
  display: flex;
}

.chat-input input {
  flex-grow: 1;
  border: 1px solid #bdc3c7;
  border-radius: 8px 0 0 8px;
  padding: 12px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.chat-input input:focus {
  outline: none;
  border-color: #3498db;
}

.chat-input button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0 25px;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: 700;
  transition: background-color 0.3s;
}

.chat-input button:hover {
  background-color: #2980b9;
}

/* RWD Media Query */
@media (max-width: 992px) {
  .home-container {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
  .candidates-section, .chat-section {
    flex: 1;
  }
}
</style>