import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// HARDCODED ADMIN EMAIL FOR DEBUGGING
const ADMIN_EMAIL = 'yayaken0702@gmail.com';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    candidates: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchCandidates() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_BASE}/candidates/manage`);
        this.candidates = response.data;
      } catch (error) {
        this.error = '無法讀取候選人列表';
        console.error('Error fetching candidates:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async addCandidate(newCandidate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post(`${API_BASE}/admin/candidates`, {
          name: newCandidate.name,
          platform: newCandidate.platform,
          email: ADMIN_EMAIL, // Hardcoded email
        });
        this.candidates.push(response.data);
      } catch (error) {
        this.error = '新增候選人失敗';
        console.error('Error adding candidate:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateCandidate(updatedCandidate) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.put(`${API_BASE}/admin/candidates/${updatedCandidate.id}`, {
          name: updatedCandidate.name,
          platform: updatedCandidate.platform,
          email: ADMIN_EMAIL, // Hardcoded email
        });
        const index = this.candidates.findIndex(c => c.id === updatedCandidate.id);
        if (index !== -1) {
          this.candidates[index] = response.data;
        }
      } catch (error) {
        this.error = '更新候選人失敗';
        console.error('Error updating candidate:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCandidate(candidateId) {
      this.isLoading = true;
      this.error = null;
      try {
        await axios.delete(`${API_BASE}/admin/candidates/${candidateId}`, {
          data: { email: ADMIN_EMAIL }, // Hardcoded email
        });
        this.candidates = this.candidates.filter(c => c.id !== candidateId);
      } catch (error) {
        this.error = '刪除候選人失敗';
        console.error('Error deleting candidate:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
