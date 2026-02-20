import { defineStore } from 'pinia';
import api from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),

  actions: {
    async register(data) {
      try {
        const response = await api.post('/auth/register', data);
        this.user = response.data.user;
        this.token = response.data.token;
        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async login(data) {
      try {
        const response = await api.post('/auth/login', data);
        this.user = response.data.user;
        this.token = response.data.token;
        this.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    async getCurrentUser() {
      try {
        const response = await api.get('/auth/me');
        this.user = response.data;
        return response.data;
      } catch (error) {
        this.logout();
        throw error;
      }
    }
  }
});
