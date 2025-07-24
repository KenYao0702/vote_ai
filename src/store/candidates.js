import { defineStore } from 'pinia';

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    candidates: [
      {
        id: 1,
        name: '候選人 A：孫悟空',
        platform: '主張每位市民發放一根金箍棒，提升全民運動風氣，並推動筋斗雲作為大眾運輸工具，解決交通問題。',
        votes: 128
      },
      {
        id: 2,
        name: '候選人 B：貝吉塔',
        platform: '專注於提升城市防禦系統，引進賽亞人訓練計畫，並承諾將戰鬥力指數納入市民健康評估標準。',
        votes: 99
      },
      {
        id: 3,
        name: '候選人 C：魯夫',
        platform: '以航向偉大航道為目標，尋找「大秘寶」來振興經濟。主張人人都能成為夥伴，打造最自由的海賊王國。',
        votes: 152
      }
    ]
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
    initializeFromStorage() {
      const storedState = localStorage.getItem('candidates-state');
      if (storedState) {
        this.candidates = JSON.parse(storedState);
      }

      window.addEventListener('storage', (event) => {
        if (event.key === 'candidates-state') {
          this.candidates = JSON.parse(event.newValue);
        }
      });
    },

    vote(candidateId) {
      const candidate = this.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.votes++;
        // In a real app, this would also trigger a blockchain transaction.
        console.log(`Voted for ${candidate.name}. New vote count: ${candidate.votes}`);
        // Save the entire state to localStorage to trigger sync across tabs
        localStorage.setItem('candidates-state', JSON.stringify(this.candidates));
      }
    }
  }
});
