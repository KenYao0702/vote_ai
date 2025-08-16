import { defineStore } from 'pinia';
import { useUserStore } from './user'; // 導入 user store

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    candidates: [] // 移除硬編碼的候選人數據
  }),
  getters: {
    totalVotes: (state) => {
      return state.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    },
    resultsWithPercentage: (state) => {
      const total = state.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
      return state.candidates.map(candidate => ({
        ...candidate,
        percentage: total > 0 ? (candidate.votes / total) * 100 : 0
      }));
    }
  },
  actions: {
    async fetchCandidates() {
      try {
        const response = await fetch('http://localhost:3000/api/candidates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.candidates = data;
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    },

    async vote(candidateId) {
      const userStore = useUserStore();
      const userEmail = userStore.user?.email;

      if (!userEmail) {
        alert('請先登入後再進行投票。');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/vote/${candidateId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: userEmail })
        });

        if (response.status === 403) {
          const data = await response.json();
          alert(data.message); // 顯示後端傳來的「您已投過票」訊息
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Vote recorded:", data);
        // 投票成功後，重新獲取候選人數據以更新介面
        await this.fetchCandidates();
      } catch (error) {
        console.error("Error recording vote:", error);
        alert('投票時發生錯誤，請稍後再試。');
      }
    }
  }
});
