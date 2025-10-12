<template>
  <div class="admin-container">
    <h1>選舉管理面板</h1>

    <div class="status-panel">
      <h2>當前選舉狀態</h2>
      <p :class="statusClass">{{ formattedStatus }}</p>
    </div>

    <div class="control-panel">
      <div v-if="candidatesStore.isVotingNotStarted">
        <h2>開始投票</h2>
        <div class="form-group">
          <label>投票持續時間:</label>
          <div class="time-inputs">
            <input type="number" v-model.number="durationHours" min="0" placeholder="小時" />
            <span>小時</span>
            <input type="number" v-model.number="durationMinutes" min="0" max="59" placeholder="分鐘" />
            <span>分鐘</span>
          </div>
        </div>
        <button @click="startElection" :disabled="totalDurationInMinutes <= 0">開始投票</button>
      </div>

      <div v-if="candidatesStore.isVotingRunning">
        <h2>結束投票</h2>
        <p>投票正在進行中。</p>
        <button @click="endElection" class="end-button">立即結束投票</button>
      </div>

      <div v-if="candidatesStore.isVotingEnded">
        <h2>投票已結束</h2>
        <p>本次投票已結束，請至結果頁面查看最終票數。</p>
        <p class="warning">如需重新舉行選舉，請執行一次「完全重置」。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCandidatesStore } from '../store/candidates';

const candidatesStore = useCandidatesStore();
const durationHours = ref(1);
const durationMinutes = ref(0);

const totalDurationInMinutes = computed(() => {
  const hours = durationHours.value || 0;
  const minutes = durationMinutes.value || 0;
  return (hours * 60) + minutes;
});

const statusMap = {
  0: '投票尚未開始',
  1: '投票進行中',
  2: '投票已結束',
};

const formattedStatus = computed(() => statusMap[candidatesStore.electionStatus] || '未知狀態');

const statusClass = computed(() => {
  switch (candidatesStore.electionStatus) {
    case 0: return 'status-not-started';
    case 1: return 'status-running';
    case 2: return 'status-ended';
    default: return '';
  }
});

function startElection() {
  if (totalDurationInMinutes.value > 0) {
    candidatesStore.startElection(totalDurationInMinutes.value);
  } else {
    alert('請輸入有效的持續時間。');
  }
}

function endElection() {
  if (confirm('您確定要立即結束投票嗎？')) {
    candidatesStore.endElection();
  }
}

onMounted(() => {
  candidatesStore.fetchElectionStatus();
});
</script>

<style scoped>
.admin-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: sans-serif;
}

h1, h2 {
  text-align: center;
  color: #333;
}

.status-panel {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
}

.status-not-started {
  background-color: #fffbe6;
  color: #b47700;
  border: 1px solid #ffe58f;
}

.status-running {
  background-color: #e6f7ff;
  color: #0050b3;
  border: 1px solid #91d5ff;
}

.status-ended {
  background-color: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}

.control-panel {
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-inputs input {
  width: 100px;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  text-align: center;
}

.time-inputs span {
  font-weight: bold;
}

button {
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  font-size: 1.1em;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.end-button {
  background-color: #dc3545;
}

.end-button:hover {
  background-color: #c82333;
}

.warning {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #b47700;
  border-radius: 4px;
  text-align: center;
}
</style>