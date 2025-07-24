<template>
  <div class="result-container">
    <h2>最終開票結果</h2>
    <div class="total-votes">
      <h3>總投票數：{{ candidatesStore.totalVotes }}</h3>
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
</template>

<script>
import { useCandidatesStore } from '../store/candidates';

export default {
  name: 'ResultPage',
  setup() {
    const candidatesStore = useCandidatesStore();
    return {
      candidatesStore
    };
  }
};
</script>

<style scoped>
.result-container {
  max-width: 800px;
  margin: auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

h2, h3 {
  text-align: center;
  color: #333;
}

.total-votes {
  background-color: #eef5ff;
  color: #007bff;
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
