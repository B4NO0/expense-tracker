import { defineStore } from 'pinia';
import api from '../api';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    budgets: [],
    loading: false,
    error: null
  }),

  getters: {
    totalExpenses: (state) => state.expenses.reduce((sum, e) => sum + e.amount, 0),
    expensesByCategory: (state) => {
      const categories = {};
      state.expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      });
      return categories;
    },
    topCategories: (state) => {
      const categories = {};
      state.expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      });
      return Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }));
    },
    monthlyTrend: (state) => {
      const months = {};
      state.expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        months[monthKey] = (months[monthKey] || 0) + expense.amount;
      });
      return Object.entries(months)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([month, amount]) => ({ month, amount }));
    },
    categoryDistribution: (state) => {
      const categories = {};
      const total = state.expenses.reduce((sum, e) => sum + e.amount, 0);
      state.expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      });
      return Object.entries(categories)
        .map(([category, amount]) => ({ 
          category, 
          amount,
          percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.amount - a.amount);
    }
  },

  actions: {
    async fetchExpenses(month = null, category = null) {
      this.loading = true;
      try {
        let url = '/expenses';
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        if (category) params.append('category', category);
        if (params.toString()) url += '?' + params.toString();

        const response = await api.get(url);
        this.expenses = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch expenses';
      } finally {
        this.loading = false;
      }
    },

    async addExpense(expense) {
      try {
        const response = await api.post('/expenses', expense);
        this.expenses.unshift(response.data);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async updateExpense(id, expense) {
      try {
        const response = await api.put(`/expenses/${id}`, expense);
        const index = this.expenses.findIndex(e => e._id === id);
        if (index !== -1) {
          this.expenses[index] = response.data;
        }
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async deleteExpense(id) {
      try {
        await api.delete(`/expenses/${id}`);
        this.expenses = this.expenses.filter(e => e._id !== id);
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async fetchBudgets(month = null) {
      this.loading = true;
      try {
        let url = '/budgets';
        if (month) url += `?month=${month}`;

        const response = await api.get(url);
        this.budgets = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch budgets';
      } finally {
        this.loading = false;
      }
    },

    async addBudget(budget) {
      try {
        const response = await api.post('/budgets', budget);
        this.budgets.push(response.data);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async updateBudget(id, budget) {
      try {
        const response = await api.put(`/budgets/${id}`, budget);
        const index = this.budgets.findIndex(b => b._id === id);
        if (index !== -1) {
          this.budgets[index] = response.data;
        }
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async deleteBudget(id) {
      try {
        await api.delete(`/budgets/${id}`);
        this.budgets = this.budgets.filter(b => b._id !== id);
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    async getBudgetStatus(id) {
      try {
        const response = await api.get(`/budgets/${id}/status`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  }
});
