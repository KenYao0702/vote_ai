import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';

export const useCandidatesStore = defineStore('candidates', () => {
  const candidates = ref([]);
  const electionStatus = ref(0); // 0: NotStarted, 1: Running, 2: Ended
  const votingStartTime = ref(0);
  const votingEndTime = ref(0);
  const remainingTime = ref('');

  let timer = null;

  const totalVotes = computed(() => {
    return candidates.value.reduce((sum, candidate) => sum + candidate.votes, 0);
  });

  const resultsWithPercentage = computed(() => {
    const total = totalVotes.value;
    return candidates.value.map(candidate => ({
      ...candidate,
      percentage: total > 0 ? (candidate.votes / total) * 100 : 0
    }));
  });

  const isVotingNotStarted = computed(() => electionStatus.value === 0);
  const isVotingRunning = computed(() => electionStatus.value === 1);
  const isVotingEnded = computed(() => electionStatus.value === 2);

      function startTimer() {

        clearInterval(timer);

        if (isVotingRunning.value) {

          // Add a unique log to verify this version is running

          console.log('TIMER RUNNING WITH LATEST FIX v3 - Time is now in milliseconds.');

    

          // Convert seconds to milliseconds

          const endTime = votingEndTime.value * 1000;

    

          // Ensure we have a valid future time

          if (isNaN(endTime) || endTime <= new Date().getTime()) {

            remainingTime.value = '00:00:00';

            return;

          }

    

          timer = setInterval(() => {

            const now = new Date().getTime();

            const distance = endTime - now;

    

            if (distance < 0) {

              remainingTime.value = '00:00:00';

              clearInterval(timer);

              fetchElectionStatus(); // Re-fetch status when time is up

              return;

            }

    

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    

            remainingTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

          }, 1000);

        } else {

          remainingTime.value = '';

        }

      }

  

    async function fetchCandidates() {

      try {

        const response = await fetch('http://localhost:3000/api/candidates');

        if (!response.ok) throw new Error("Failed to fetch candidates.");

        candidates.value = await response.json();

      } catch (error) {

        console.error("Error fetching candidates:", error);

      }

    }

  

    async function fetchElectionStatus() {

        try {

            const response = await fetch(`http://localhost:3000/api/election/status?_=${new Date().getTime()}`);

            if (!response.ok) throw new Error("Failed to fetch election status.");

            const data = await response.json();

            electionStatus.value = data.status;

  

            if (electionStatus.value === 1) {

                const detailsFetched = await fetchElectionDetails();

                if (detailsFetched) {

                  startTimer();

                }

            } else {

                clearInterval(timer);

                remainingTime.value = '';

            }

        } catch (error) {

            console.error("Error fetching election status:", error);

        }

    }

  

    async function fetchElectionDetails() {

        try {

            const response = await fetch(`http://localhost:3000/api/election/details?_=${new Date().getTime()}`);

            if (!response.ok) throw new Error("Failed to fetch election details.");

            const data = await response.json();

            if (data && data.endTime) {

              votingStartTime.value = data.startTime;

              votingEndTime.value = data.endTime;

              return true;

            } else {

              console.error("Error: Invalid data from election details API.");

              votingEndTime.value = 0; // Reset to ensure no stale data is used

              return false;

            }

        } catch (error) {

            console.error("Error fetching election details:", error);

            votingEndTime.value = 0; // Reset on error

            return false;

        }

    }

  async function vote(candidateId) {
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
      await fetchCandidates();
    } catch (error) {
      console.error("Error recording vote:", error);
      alert(error.message);
    }
  }

  async function startElection(duration) {
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
          await fetchElectionStatus();
      } catch (error) {
          console.error("Error starting election:", error);
          alert(error.message);
      }
  }

  async function endElection() {
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
          await fetchElectionStatus();
      } catch (error) {
          console.error("Error ending election:", error);
          alert(error.message);
      }
  }

  return { 
    candidates, 
    electionStatus, 
    votingStartTime, 
    votingEndTime, 
    remainingTime,
    totalVotes,
    resultsWithPercentage,
    isVotingNotStarted,
    isVotingRunning,
    isVotingEnded,
    startTimer,
    fetchCandidates,
    fetchElectionStatus,
    fetchElectionDetails,
    vote,
    startElection,
    endElection
  };
});
