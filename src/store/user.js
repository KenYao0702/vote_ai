import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // { name, email, photo }
    isAdmin: false,
  }),
  actions: {
    setUser(userData, isAdmin = false) {
      this.user = userData;
      this.isAdmin = isAdmin;
      // Store everything in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
    },
    clearUser() {
      this.user = null;
      this.isAdmin = false;
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
    },
    initializeFromStorage() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
      const storedIsAdmin = localStorage.getItem('isAdmin');
      if (storedIsAdmin) {
        this.isAdmin = JSON.parse(storedIsAdmin);
      }
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    getUser: (state) => state.user,
    // The isAdmin state is directly accessible, but a getter is good practice
    getIsAdmin: (state) => state.isAdmin,
  },
});
