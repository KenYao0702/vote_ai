import { defineStore } from 'pinia';
import { useUserStore } from './user';

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    candidates: [],
    electionStatus: 0, // 0: NotStarted, 1: Running, 2: Ended
    votingStartTime: 0,
    votingEndTime: 0,
  }),
  getters: {
    totalVotes: (state) => {
      return state.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    },
    resultsWithPercentage: (state) => {
      const total = state.totalVotes;
      return state.candidates.map(candidate => ({
        ...candidate,
        percentage: total > 0 ? (candidate.votes / total) * 100 : 0
      }));
    },
    isVotingNotStarted: (state) => state.electionStatus === 0,
    isVotingRunning: (state) => state.electionStatus === 1,
    isVotingEnded: (state) => state.electionStatus === 2,
  },
  actions: {
    async fetchCandidates() {
      try {
        const response = await fetch('http://localhost:3000/api/candidates');
        if (!response.ok) throw new Error("Failed to fetch candidates.");
        this.candidates = await response.json();
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    },

    async fetchElectionStatus() {
        try {
            const response = await fetch('http://localhost:3000/api/election/status');
            if (!response.ok) throw new Error("Failed to fetch election status.");
            const data = await response.json();
            this.electionStatus = data.status;
        } catch (error) {
            console.error("Error fetching election status:", error);
        }
    },

    async fetchElectionDetails() {
        try {
            const response = await fetch('http://localhost:3000/api/election/details');
            if (!response.ok) throw new Error("Failed to fetch election details.");
            const data = await response.json();
            this.votingStartTime = data.startTime;
            this.votingEndTime = data.endTime;
        } catch (error) {
            console.error("Error fetching election details:", error);
        }
    },

    async vote(candidateId) {
      const userStore = useUserStore();
      if (!userStore.isLoggedIn) {
        alert('請先登入後再進行投票。');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/vote/${candidateId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: userStore.user.email })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || '投票時發生錯誤。');
        }
        
        alert('投票成功！您的投票已記錄在區塊鏈上。');
        // Re-fetch candidates to show updated vote count
        await this.fetchCandidates();
      } catch (error) {
        console.error("Error recording vote:", error);
        alert(error.message);
      }
    },

    async startElection(duration) {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) {
            alert('請先登入。');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/admin/start-voting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userStore.user.email, duration: duration })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert('投票已成功開始！');
            await this.fetchElectionStatus();
            await this.fetchElectionDetails();
        } catch (error) {
            console.error("Error starting election:", error);
            alert(error.message);
        }
    },

    async endElection() {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) {
            alert('請先登入。');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/admin/end-voting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userStore.user.email })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert('投票已成功結束！');
            await this.fetchElectionStatus();
            await this.fetchElectionDetails();
        } catch (error) {
            console.error("Error ending election:", error);
            alert(error.message);
        }
    }
  }
});
