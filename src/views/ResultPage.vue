<template>
  <div class="result-container">
    <h2>開票結果</h2>

    <div v-if="!candidatesStore.isVotingEnded" class="status-banner info">
      <p>投票尚未結束。</p>
      <p>最終結果將在投票結束後公布。</p>
    </div>

    <div v-else>
      <div class="total-votes">
        <h3>總投票數 (來自區塊鏈)：{{ candidatesStore.totalVotes }}</h3>
      </div>
      <div class="results-breakdown">
        <div v-for="candidate in candidatesStore.resultsWithPercentage" :key="candidate.id" class="candidate-result">
          <h4>{{ candidate.name }}</h4>
          <div class="progress-bar">
            <div class="progress" :style="{ width: candidate.percentage + '%' }"></div>
          </div>
          <div class="result-details">
            <span class="vote-count">{{ candidate.votes }} 票</span>
            <span class="vote-percentage">{{ candidate.percentage.toFixed(2) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCandidatesStore } from '../store/candidates';

const candidatesStore = useCandidatesStore();

// Fetch initial data when the component is mounted
onMounted(() => {
  // Fetch candidates which now includes the final vote counts from the blockchain
  candidatesStore.fetchCandidates();
  // Fetch the current status to decide whether to show results
  candidatesStore.fetchElectionStatus();
});
</script>

<style scoped>
.result-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2, h3 {
  text-align: center;
  color: #333;
}

.status-banner {
  padding: 2rem;
  margin-top: 2rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
}
.info {
  background-color: #eef5ff;
  color: #0050b3;
}

.total-votes {
  background-color: #f6ffed;
  color: #389e0d;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.candidate-result {
  margin-bottom: 25px;
}

.progress-bar {
  background-color: #e9ecef;
  border-radius: 20px;
  height: 20px;
  overflow: hidden;
  margin: 10px 0;
}

.progress {
  background-color: #28a745;
  height: 100%;
  border-radius: 20px;
  transition: width 0.5s ease-in-out;
}

.result-details {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
  font-weight: bold;
}

.vote-percentage {
  color: #28a745;
}
</style>
