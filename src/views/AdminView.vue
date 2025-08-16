<template>
  <div class="admin-container">
    <h1>管理員後台</h1>

    <!-- Add Candidate Form -->
    <div class="add-candidate-form">
      <h2>新增候選人</h2>
      <div>
        <input v-model="newCandidateName" placeholder="輸入候選人姓名" />
        <textarea v-model="newCandidatePlatform" placeholder="輸入候選人政見" rows="3"></textarea>
      </div>
      <button @click="addCandidate">新增</button>
    </div>

    <!-- Candidate List -->
    <div class="candidate-list">
      <h2>候選人列表</h2>
      <ul>
        <li v-for="candidate in candidates" :key="candidate.id">
          <template v-if="editingCandidateId === candidate.id">
            <!-- 編輯模式 -->
            <div class="edit-form">
              <input v-model="editedCandidateName" placeholder="候選人姓名" />
              <textarea v-model="editedCandidatePlatform" placeholder="候選人政見" rows="3"></textarea>
              <div class="edit-actions">
                <button @click="saveEdit(candidate.id)" class="save-button">保存</button>
                <button @click="cancelEdit" class="cancel-button">取消</button>
              </div>
            </div>
          </template>
          <template v-else>
            <!-- 顯示模式 -->
            <div class="candidate-info">
              <span>{{ candidate.name }}</span>
              <p class="platform-text">{{ candidate.platform }}</p>
            </div>
            <div class="actions">
              <button @click="startEdit(candidate)">編輯</button>
              <button @click="deleteCandidate(candidate.id)">刪除</button>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default {
  name: 'AdminView',
  data() {
    return {
      newCandidateName: '',
      newCandidatePlatform: '',
      candidates: [],
      editingCandidateId: null, // 當前正在編輯的候選人ID
      editedCandidateName: '', // 編輯中的姓名
      editedCandidatePlatform: '', // 編輯中的政見
    };
  },
  methods: {
    async fetchCandidates() {
      try {
        const response = await axios.get(`${API_URL}/candidates`);
        this.candidates = response.data;
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
        alert('無法獲取候選人列表');
      }
    },
    async addCandidate() {
      if (!this.newCandidateName.trim()) {
        alert('請輸入候選人姓名');
        return;
      }
      try {
        const response = await axios.post(`${API_URL}/admin/candidates`, {
          name: this.newCandidateName,
          platform: this.newCandidatePlatform,
        });
        this.candidates.push(response.data.candidate);
        this.newCandidateName = ''; // Clear input
        this.newCandidatePlatform = ''; // Clear input
        alert('新增成功');
      } catch (error) {
        console.error('Failed to add candidate:', error);
        alert('新增失敗');
      }
    },
    startEdit(candidate) {
      console.log('Starting edit for candidate:', candidate.id);
      this.editingCandidateId = candidate.id;
      this.editedCandidateName = candidate.name;
      this.editedCandidatePlatform = candidate.platform;
    },
    cancelEdit() {
      this.editingCandidateId = null;
      this.editedCandidateName = '';
      this.editedCandidatePlatform = '';
    },
    async saveEdit(candidateId) {
      const candidate = this.candidates.find(c => c.id === candidateId);
      if (!candidate) return;

      // 檢查是否有實際修改
      if (this.editedCandidateName.trim() === candidate.name &&
          this.editedCandidatePlatform.trim() === candidate.platform) {
        this.cancelEdit(); // 沒有修改則直接取消編輯模式
        return;
      }

      try {
        await axios.put(`${API_URL}/admin/candidates/${candidateId}`, {
          name: this.editedCandidateName,
          platform: this.editedCandidatePlatform,
        });
        // 更新本地數據
        candidate.name = this.editedCandidateName;
        candidate.platform = this.editedCandidatePlatform;
        alert('更新成功');
        this.cancelEdit(); // 退出編輯模式
      } catch (error) {
        console.error('Failed to update candidate:', error);
        alert('更新失敗');
      }
    },
    async deleteCandidate(id) {
      if (confirm('確定要刪除這位候選人嗎？')) {
        try {
          await axios.delete(`${API_URL}/admin/candidates/${id}`);
          this.candidates = this.candidates.filter(c => c.id !== id);
          alert('刪除成功');
        } catch (error) {
          console.error('Failed to delete candidate:', error);
          alert('刪除失敗');
        }
      }
    },
  },
  created() {
    this.fetchCandidates();
  },
};
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  font-family: sans-serif;
}
.add-candidate-form, .candidate-list {
  margin-bottom: 2rem;
}

.add-candidate-form h2, .candidate-list h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.add-candidate-form {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 10px; /* 元素間的間距 */
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.add-candidate-form input, .add-candidate-form textarea {
  width: calc(100% - 1rem);
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

.add-candidate-form textarea {
  resize: vertical; /* 允許垂直調整大小 */
  min-height: 80px;
}

.add-candidate-form button {
  align-self: flex-end; /* 按鈕靠右 */
  padding: 0.7rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-candidate-form button:hover {
  background-color: #0056b3;
}

.candidate-list ul {
  list-style: none;
  padding: 0;
}

.candidate-list li {
  display: flex;
  flex-direction: column; /* 垂直排列內容 */
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.candidate-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.candidate-info span {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}

.platform-text {
  font-size: 0.9em;
  color: #555;
  margin-top: 0.3em;
  white-space: pre-wrap; /* 保留換行符 */
  flex-grow: 1; /* 讓政見文字佔據空間 */
}

.actions {
  display: flex;
  justify-content: flex-end; /* 按鈕靠右 */
  gap: 10px; /* 按鈕間距 */
  margin-top: 10px;
}

.actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actions .save-button {
  background-color: #28a745;
  color: white;
}

.actions .save-button:hover {
  background-color: #218838;
}

.actions .cancel-button {
  background-color: #ffc107;
  color: #333;
}

.actions .cancel-button:hover {
  background-color: #e0a800;
}

.actions button:last-child {
  background-color: #dc3545;
  color: white;
}

.actions button:last-child:hover {
  background-color: #c82333;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.edit-form input, .edit-form textarea {
  width: calc(100% - 1rem);
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>