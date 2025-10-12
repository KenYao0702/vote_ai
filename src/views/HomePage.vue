<template>
  <div class="home-container">
    <div class="candidates-section">
      <h2>候選人列表</h2>

      <div v-if="candidatesStore.isVotingNotStarted" class="status-banner info">
        投票尚未開始，請等候管理員開啟。
      </div>
      <div v-if="candidatesStore.isVotingRunning" class="status-banner running">
        投票進行中！剩餘時間：<strong>{{ remainingTime }}</strong>
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
import { ref, onMounted, onUnmounted } from 'vue';
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

const remainingTime = ref('計算中...');
let timerInterval = null;

const updateRemainingTime = () => {
  if (candidatesStore.isVotingRunning && candidatesStore.votingEndTime > 0) {
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = candidatesStore.votingEndTime - now;

    if (secondsLeft <= 0) {
      remainingTime.value = '00:00:00';
      candidatesStore.fetchElectionStatus();
      return;
    }

    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    remainingTime.value = 
      `${String(hours).padStart(2, '0')}:` +
      `${String(minutes).padStart(2, '0')}:` +
      `${String(seconds).padStart(2, '0')}`;
  } else {
    remainingTime.value = 'N/A';
  }
};

onMounted(async () => {
  await Promise.all([
    candidatesStore.fetchCandidates(),
    candidatesStore.fetchElectionStatus(),
    candidatesStore.fetchElectionDetails()
  ]);
  
  updateRemainingTime();
  timerInterval = setInterval(updateRemainingTime, 1000);
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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

.status-banner {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1em;
  font-weight: bold;
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.candidate-card:hover {
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  align-items: flex-start; /* Align to top for better look with large image */
  gap: 20px;
  margin-bottom: 15px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 8px; /* Rounded square */
  object-fit: cover;
  border: 2px solid #f0f0f0;
  flex-shrink: 0; /* Prevent image from shrinking */
}

.candidate-name {
  margin: 0;
  font-size: 1.5em;
}

.media-container {
  margin: 15px 0;
  text-align: center;
}

.candidate-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: none;
}

.platform {
  color: #555;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 120px; /* 限制最大高度 */
  overflow-y: auto;   /* 超出則滾動 */
  padding-right: 5px; /* 避免滾動條太貼近文字 */
}

.vote-action {
  display: flex;
  justify-content: flex-end;
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
  min-width: 100px;
  text-align: center;
}

.vote-button:hover:not(:disabled) {
  background-color: #218838;
}

.vote-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
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
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-message {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  max-width: 80%;
  line-height: 1.4;
}

.user-message {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
}

.ai-message {
  background-color: #eef5ff;
  align-self: flex-start;
  max-width: 70%;
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

/* RWD Media Query */
@media (max-width: 992px) {
  .home-container {
    flex-direction: column;
  }
  .candidates-section, .chat-section {
    flex: 1; /* 讓兩欄在垂直堆疊時寬度一致 */
  }
}
</style>