<template>
  <div class="dashboard">
    <header class="top-bar">
      <h1>Expense Tracker</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </header>

    <div class="container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          :class="['tab-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'Analytics'" class="tab-content">
        <!-- Simple Filter Bar -->
        <div class="filter-bar">
          <div class="filter-group">
            <label>Year</label>
            <select v-model="selectedYear" class="filter-select">
              <option :value="null">All Years</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Month</label>
            <select v-model="selectedMonth" class="filter-select">
              <option value="">All Months</option>
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Category</label>
            <select v-model="selectedCategory" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <button @click="clearFilters" class="btn-clear" :disabled="!hasActiveFilters">
            Clear Filters
          </button>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filter-label">Active:</span>
          <span v-if="selectedYear" class="filter-tag">
            Year: {{ selectedYear }}
            <button @click="selectedYear = null" class="remove-filter">×</button>
          </span>
          <span v-if="selectedMonth !== ''" class="filter-tag">
            Month: {{ months[selectedMonth] }}
            <button @click="selectedMonth = ''" class="remove-filter">×</button>
          </span>
          <span v-if="selectedCategory" class="filter-tag">
            Category: {{ selectedCategory }}
            <button @click="selectedCategory = ''" class="remove-filter">×</button>
          </span>
        </div>

        <div class="analytics-container">
          <!-- Overview Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <span class="stat-label">Total Spending</span>
                <strong class="stat-value">₱{{ formatMoney(totalFilteredExpenses) }}</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <span class="stat-label">Transactions</span>
                <strong class="stat-value">{{ filteredExpenses.length }}</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <span class="stat-label">Average</span>
                <strong class="stat-value">₱{{ formatMoney(averageTransaction) }}</strong>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <span class="stat-label">Categories</span>
                <strong class="stat-value">{{ Object.keys(categoryTotals).length }}</strong>
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="analytics-grid">
            <!-- Spending by Category (Left) -->
            <div class="analytics-section">
              <div class="section-header">
                <h3>⏱ Spending by Category</h3>
              </div>
              <div v-if="distribution.length === 0" class="no-data">
                No data available
              </div>
              <div v-else class="spending-by-category">
                <div v-for="(item, index) in distribution" :key="item.category" class="spending-item">
                  <div class="spending-header">
                    <div class="category-dot" :style="{ backgroundColor: getCategoryColor(item.category) }"></div>
                    <span class="spending-category">{{ item.category }}</span>
                    <span class="spending-amount">₱{{ formatMoney(item.amount, 0) }}</span>
                  </div>
                  <div class="spending-bar-wrapper">
                    <div class="spending-bar">
                      <div 
                        class="spending-bar-fill" 
                        :style="{ width: item.percentage + '%', backgroundColor: getCategoryColor(item.category) }"
                      ></div>
                    </div>
                    <span class="spending-percent">{{ item.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Monthly Expense Trend (Right) -->
            <div class="analytics-section">
              <div class="section-header">
                <h3>📊 Monthly Expense Trend</h3>
              </div>
              <div v-if="monthlyData.length === 0" class="no-data">
                No data available
              </div>
              <div v-else>
                <div class="trend-container">
                  <div v-for="item in monthlyData" :key="item.month" class="trend-column">
                    <div class="bar-wrapper">
                      <div 
                        class="trend-bar" 
                        :style="{ height: (item.amount / maxMonthlyAmount * 150) + 'px' }"
                        :title="'₱' + formatMoney(item.amount)"
                      ></div>
                    </div>
                    <span class="trend-label">{{ item.month }}</span>
                  </div>
                </div>
                <div class="trend-stats">
                  <p>Average per month: <strong>₱{{ formatMoney(averageMonthly) }}</strong></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Spending Categories Section (Moved Below) -->
          <div class="analytics-section">
            <div class="section-header">
              <h3>🏆 Top Spending Categories</h3>
              <select v-model="topN" class="small-select">
                <option :value="3">Top 3</option>
                <option :value="5">Top 5</option>
                <option :value="10">Top 10</option>
              </select>
            </div>
            <div v-if="topCategories.length === 0" class="no-data">
              No data available
            </div>
            <div v-else class="top-categories">
              <div v-for="(item, index) in topCategories" :key="item.category" class="top-category-item">
                <div class="top-category-rank" :class="getRankClass(index)">
                  {{ index + 1 }}
                </div>
                <div class="top-category-info">
                  <span class="top-category-name">{{ item.category }}</span>
                  <div class="top-category-bar">
                    <div 
                      class="top-category-fill" 
                      :style="{ width: (item.amount / topCategories[0].amount * 100) + '%' }"
                    ></div>
                  </div>
                </div>
                <span class="top-category-amount">₱{{ formatMoney(item.amount) }}</span>
              </div>
              
              <!-- Total and Percentage Footer -->
              <div class="top-categories-footer">
                <div class="total-top">
                  <span>Total (Top {{ topN }}):</span>
                  <span class="total-amount">₱{{ formatMoney(topCategoriesTotal) }}</span>
                </div>
                <div class="percentage">
                  {{ topCategoriesPercentage }}% of total expenses
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Tab -->
      <div v-if="activeTab === 'Expenses'" class="tab-content">
        <div class="expenses-dashboard">
          <!-- Donut Chart Section -->
          <div class="chart-section">
            <h2>Expense Distribution</h2>
            <div class="donut-chart-container">
              <svg viewBox="0 0 100 100" class="donut-chart">
                <!-- Background circle -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="15" />
                
                <!-- Segments -->
                <circle 
                  v-for="(segment, index) in donutSegments" 
                  :key="index"
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  :stroke="segment.color" 
                  stroke-width="15"
                  :stroke-dasharray="segment.dashArray"
                  :stroke-dashoffset="segment.dashOffset"
                  :transform="'rotate(' + segment.rotation + ' 50 50)'"
                  class="donut-segment"
                />
                
                <!-- Center text -->
                <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" class="donut-center-text">
                  {{ filteredExpenses.length }}
                  <tspan x="50" y="60" class="donut-center-label">Items</tspan>
                </text>
              </svg>
            </div>
            <div class="chart-legend">
              <div 
                v-for="(item, index) in distribution" 
                :key="item.category" 
                class="legend-item"
                :class="{ 'legend-item-active': selectedCategory === item.category }"
                @click="toggleCategoryFilter(item.category)"
              >
                <span class="legend-color" :style="{ backgroundColor: getCategoryColor(item.category) }"></span>
                <span class="legend-label">{{ item.category }}</span>
                <span class="legend-value">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>

          <!-- Expenses List Section -->
          <div class="section">
            <div class="section-header">
              <h2>Your Expenses</h2>
              <button @click="openExpenseModal" class="btn-primary">+ Add Expense</button>
            </div>

            <div v-if="expenseStore.loading" class="loading">Loading expenses...</div>
            <div v-else-if="expenseStore.expenses.length === 0" class="no-data">
              No expenses found
            </div>
            <div v-else class="expenses-list">
              <div v-for="expense in expenseStore.expenses" :key="expense._id" class="expense-item">
                <div class="expense-info">
                  <div class="expense-header">
                    <strong>{{ expense.description }}</strong>
                    <span class="category-badge">{{ expense.category }}</span>
                  </div>
                  <small>{{ formatDate(expense.date) }}</small>
                </div>
                <div class="expense-amount">₱{{ formatMoney(expense.amount) }}</div>
                <div class="expense-actions">
                  <button @click="openEditExpenseModal(expense)" class="btn-edit">Edit</button>
                  <button @click="deleteExpense(expense._id)" class="btn-delete">Delete</button>
                </div>
              </div>
            </div>

            <div v-if="expenseStore.expenses.length > 0" class="total">
              <strong>Total: ₱{{ formatMoney(expenseStore.totalExpenses) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Tab -->
      <div v-if="activeTab === 'Budgets'" class="tab-content">
        <div class="budgets-dashboard">
          <!-- Create Budget Button -->
          <div class="section">
            <div class="section-header">
              <h2>Your Budgets</h2>
              <button @click="openBudgetModal" class="btn-primary">+ Create Budget</button>
            </div>

            <div v-if="expenseStore.loading" class="loading">Loading budgets...</div>
            <div v-else-if="expenseStore.budgets.length === 0" class="no-data">
              No budgets found
            </div>
            <div v-else class="budgets-list">
              <div v-for="budget in expenseStore.budgets" :key="budget._id" class="budget-card">
                <div class="budget-header">
                  <h3>{{ budget.category }}</h3>
                  <small>{{ budget.month }}</small>
                </div>
                <div class="budget-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: Math.min(100, (budgetSpent[budget._id] / budget.limit) * 100) + '%' }"
                    ></div>
                  </div>
                  <div class="budget-stats">
                    <span>Spent: ₱{{ formatMoney(budgetSpent[budget._id] || 0) }}</span>
                    <span>Limit: ₱{{ formatMoney(budget.limit) }}</span>
                  </div>
                </div>
                <div class="budget-actions">
                  <button @click="openEditBudgetModal(budget)" class="btn-edit">Edit</button>
                  <button @click="deleteBudget(budget._id)" class="btn-delete">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="openExpenseModal">＋</button>

    <!-- Expense Modal -->
    <div v-if="showExpenseModal" class="modal-overlay" @click.self="closeExpenseModal">
      <div class="modal-card">
        <h3>{{ editingExpense ? 'Edit Expense' : 'Add Expense' }}</h3>
        <form @submit.prevent="handleExpenseSubmit" class="modal-form">
          <input v-model="expenseForm.description" type="text" placeholder="Description" required />
          <input v-model.number="expenseForm.amount" type="number" placeholder="Amount" step="0.01" required />
          <select v-model="expenseForm.category" required>
            <option value="">Select Category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <input v-model="expenseForm.date" type="date" required />
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeExpenseModal">Cancel</button>
            <button type="submit" class="btn-primary">{{ editingExpense ? 'Update' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Budget Modal -->
    <div v-if="showBudgetModal" class="modal-overlay" @click.self="closeBudgetModal">
      <div class="modal-card">
        <h3>{{ editingBudget ? 'Edit Budget' : 'Create Budget' }}</h3>
        <form @submit.prevent="handleBudgetSubmit" class="modal-form">
          <select v-model="budgetForm.category" required>
            <option value="">Select Category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <input 
            v-model.number="budgetForm.limit" 
            type="number" 
            placeholder="Budget Limit"
            step="0.01"
            required
          />
          <input 
            v-model="budgetForm.month" 
            type="month"
            required
          />
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeBudgetModal">Cancel</button>
            <button type="submit" class="btn-primary">{{ editingBudget ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/authStore';
import { useExpenseStore } from '../stores/expenseStore';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore();
    const expenseStore = useExpenseStore();
    const router = useRouter();

    // UI State
    const activeTab = ref('Analytics');
    const tabs = ['Analytics', 'Expenses', 'Budgets'];
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Education', 'Other'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Modal State
    const showExpenseModal = ref(false);
    const showBudgetModal = ref(false);
    const editingExpense = ref(null);
    const editingBudget = ref(null);

    // Filter State
    const selectedYear = ref(null);
    const selectedMonth = ref('');
    const selectedCategory = ref('');
    const topN = ref(5);
    const distributionLimit = ref(0);

    // Form State
    const expenseForm = ref({
      description: '',
      amount: null,
      category: '',
      date: new Date().toISOString().split('T')[0]
    });

    const budgetForm = ref({
      category: '',
      limit: null,
      month: new Date().toISOString().slice(0, 7)
    });

    const budgetSpent = ref({});

    // Computed Properties
    const filteredExpenses = computed(() => {
      return expenseStore.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth();

        // Year filter
        if (selectedYear.value !== null && expenseYear !== selectedYear.value) {
          return false;
        }

        // Month filter
        if (selectedMonth.value !== '') {
          if (expenseMonth !== Number(selectedMonth.value)) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory.value && expense.category !== selectedCategory.value) {
          return false;
        }

        return true;
      });
    });

    const hasActiveFilters = computed(() => {
      return selectedYear.value !== null || 
             selectedMonth.value !== '' || 
             selectedCategory.value !== '';
    });

    const totalFilteredExpenses = computed(() => {
      return filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0);
    });

    const averageTransaction = computed(() => {
      if (filteredExpenses.value.length === 0) return 0;
      return totalFilteredExpenses.value / filteredExpenses.value.length;
    });

    const categoryTotals = computed(() => {
      const totals = {};
      filteredExpenses.value.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      });
      return totals;
    });

    const topCategories = computed(() => {
      return Object.entries(categoryTotals.value)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, topN.value);
    });

    const topCategoriesTotal = computed(() => {
      return topCategories.value.reduce((sum, item) => sum + item.amount, 0);
    });

    const topCategoriesPercentage = computed(() => {
      if (totalFilteredExpenses.value === 0) return 0;
      return ((topCategoriesTotal.value / totalFilteredExpenses.value) * 100).toFixed(1);
    });

    const distribution = computed(() => {
      const total = totalFilteredExpenses.value;
      if (total === 0) return [];
      
      let items = Object.entries(categoryTotals.value)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: ((amount / total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.amount - a.amount);
      
      if (distributionLimit.value > 0) {
        items = items.slice(0, distributionLimit.value);
      }
      return items;
    });

    const monthlyData = computed(() => {
      const data = months.map((month, index) => ({
        month,
        amount: 0,
        monthIndex: index
      }));

      filteredExpenses.value.forEach(expense => {
        const date = new Date(expense.date);
        const monthIndex = date.getMonth();
        data[monthIndex].amount += expense.amount;
      });

      return data;
    });

    const maxMonthlyAmount = computed(() => {
      const max = Math.max(...monthlyData.value.map(m => m.amount));
      return max || 1;
    });

    const averageMonthly = computed(() => {
      const monthsWithData = monthlyData.value.filter(m => m.amount > 0);
      if (monthsWithData.length === 0) return 0;
      const total = monthsWithData.reduce((sum, m) => sum + m.amount, 0);
      return total / monthsWithData.length;
    });

    const availableYears = computed(() => {
      const years = new Set();
      expenseStore.expenses.forEach(e => {
        years.add(new Date(e.date).getFullYear());
      });
      // Add current year and surrounding years for selection
      const currentYear = new Date().getFullYear();
      for (let year = 2020; year <= currentYear; year++) {
        years.add(year);
      }
      return Array.from(years).sort((a, b) => b - a);
    });

    // Donut Chart Computed
    const donutSegments = computed(() => {
      const total = totalFilteredExpenses.value;
      if (total === 0) return [];

      let cumulativePercent = 0;
      return distribution.value.map((item) => {
        const percentage = parseFloat(item.percentage);
        const dashArray = `${percentage} ${100 - percentage}`;
        const dashOffset = -cumulativePercent;
        cumulativePercent += percentage;
        
        return {
          ...item,
          dashArray,
          dashOffset,
          rotation: cumulativePercent - percentage,
          color: getCategoryColor(item.category)
        };
      });
    });

    // Budget Donut Chart
    const totalBudgetLimit = computed(() => {
      return expenseStore.budgets.reduce((sum, budget) => sum + budget.limit, 0);
    });

    const totalBudgetSpent = computed(() => {
      return Object.values(budgetSpent.value).reduce((sum, spent) => sum + spent, 0);
    });

    const totalBudgetRemaining = computed(() => {
      return totalBudgetLimit.value - totalBudgetSpent.value;
    });

    const totalBudgetPercentage = computed(() => {
      if (totalBudgetLimit.value === 0) return 0;
      return ((totalBudgetSpent.value / totalBudgetLimit.value) * 100).toFixed(1);
    });

    const budgetDonutSegments = computed(() => {
      const percentage = Math.min(100, totalBudgetPercentage.value);
      return {
        spent: {
          dashArray: `${percentage} ${100 - percentage}`,
          dashOffset: 0
        }
      };
    });

    // Methods
    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    const clearFilters = () => {
      selectedYear.value = null;
      selectedMonth.value = '';
      selectedCategory.value = '';
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const formatMoney = (amount, decimals = 2) => {
      return amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const fetchExpensesFiltered = async () => {
      await expenseStore.fetchExpenses();
    };

    // Expense CRUD
    const openExpenseModal = () => {
      editingExpense.value = null;
      expenseForm.value = {
        description: '',
        amount: null,
        category: '',
        date: new Date().toISOString().split('T')[0]
      };
      showExpenseModal.value = true;
    };

    const openEditExpenseModal = (expense) => {
      editingExpense.value = expense;
      expenseForm.value = {
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date.split('T')[0]
      };
      showExpenseModal.value = true;
    };

    const closeExpenseModal = () => {
      showExpenseModal.value = false;
      editingExpense.value = null;
    };

    const handleExpenseSubmit = async () => {
      try {
        if (editingExpense.value) {
          await expenseStore.updateExpense(editingExpense.value._id, expenseForm.value);
        } else {
          await expenseStore.addExpense(expenseForm.value);
        }
        await fetchExpensesFiltered();
        closeExpenseModal();
      } catch (error) {
        alert('Failed to save expense: ' + error.message);
      }
    };

    const deleteExpense = async (id) => {
      if (confirm('Are you sure you want to delete this expense?')) {
        try {
          await expenseStore.deleteExpense(id);
          await fetchExpensesFiltered();
        } catch (error) {
          alert('Failed to delete expense');
        }
      }
    };

    // Budget CRUD
    const openBudgetModal = () => {
      editingBudget.value = null;
      budgetForm.value = {
        category: '',
        limit: null,
        month: new Date().toISOString().slice(0, 7)
      };
      showBudgetModal.value = true;
    };

    const openEditBudgetModal = (budget) => {
      editingBudget.value = budget;
      budgetForm.value = {
        category: budget.category,
        limit: budget.limit,
        month: budget.month
      };
      showBudgetModal.value = true;
    };

    const closeBudgetModal = () => {
      showBudgetModal.value = false;
      editingBudget.value = null;
    };

    const handleBudgetSubmit = async () => {
      try {
        if (editingBudget.value) {
          await expenseStore.updateBudget(editingBudget.value._id, budgetForm.value);
        } else {
          await expenseStore.addBudget(budgetForm.value);
        }
        await expenseStore.fetchBudgets();
        await loadBudgetSpent();
        closeBudgetModal();
      } catch (error) {
        alert('Failed to save budget: ' + error.message);
      }
    };

    const deleteBudget = async (id) => {
      if (confirm('Are you sure you want to delete this budget?')) {
        try {
          await expenseStore.deleteBudget(id);
          await expenseStore.fetchBudgets();
        } catch (error) {
          alert('Failed to delete budget');
        }
      }
    };

    const loadBudgetSpent = async () => {
      for (let budget of expenseStore.budgets) {
        try {
          const status = await expenseStore.getBudgetStatus(budget._id);
          budgetSpent.value[budget._id] = status.spent;
        } catch (error) {
          console.error('Failed to load budget status for', budget._id);
        }
      }
    };

    const toggleCategoryFilter = (category) => {
      if (selectedCategory.value === category) {
        selectedCategory.value = '';
      } else {
        selectedCategory.value = category;
      }
    };

    const getCategoryColor = (categoryOrIndex) => {
      const colors = [
        '#14b8a6', // teal
        '#3b82f6', // blue
        '#a855f7', // purple
        '#f59e0b', // orange
        '#ef4444', // red
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#ec4899'  // pink
      ];
      
      // If it's a number (index), use it directly
      if (typeof categoryOrIndex === 'number') {
        return colors[categoryOrIndex % colors.length];
      }
      
      // If it's a string (category name), find its index in categories array
      const categoryIndex = categories.indexOf(categoryOrIndex);
      return colors[categoryIndex % colors.length];
    };

    const getRankClass = (index) => {
      if (index === 0) return 'gold-rank';
      if (index === 1) return 'silver-rank';
      if (index === 2) return 'bronze-rank';
      return '';
    };

    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        router.push('/login');
        return;
      }

      await fetchExpensesFiltered();
      await expenseStore.fetchBudgets();
      await loadBudgetSpent();
    });

    return {
      // State
      activeTab,
      tabs,
      categories,
      months,
      showExpenseModal,
      showBudgetModal,
      editingExpense,
      editingBudget,
      expenseForm,
      budgetForm,
      budgetSpent,
      expenseStore,
      
      // Filters
      selectedYear,
      selectedMonth,
      selectedCategory,
      topN,
      distributionLimit,
      hasActiveFilters,
      availableYears,
      
      // Computed
      filteredExpenses,
      totalFilteredExpenses,
      averageTransaction,
      categoryTotals,
      topCategories,
      topCategoriesTotal,
      topCategoriesPercentage,
      distribution,
      monthlyData,
      maxMonthlyAmount,
      averageMonthly,
      donutSegments,
      totalBudgetLimit,
      totalBudgetSpent,
      totalBudgetRemaining,
      totalBudgetPercentage,
      budgetDonutSegments,
      
      // Methods
      logout,
      clearFilters,
      formatDate,
      formatMoney,
      fetchExpensesFiltered,
      openExpenseModal,
      openEditExpenseModal,
      closeExpenseModal,
      handleExpenseSubmit,
      deleteExpense,
      openBudgetModal,
      openEditBudgetModal,
      closeBudgetModal,
      handleBudgetSubmit,
      deleteBudget,
      toggleCategoryFilter,
      getCategoryColor,
      getRankClass
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}

.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%);
}

.top-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.top-bar h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 25px;
  border-bottom: 1px solid #e0e7ff;
}

.tab-btn {
  padding: 14px 28px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

/* Filter Bar */
.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: flex-end;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  min-width: 160px;
  flex: 1;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.filter-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-clear {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  height: 42px;
}

.btn-clear:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Active Filters */
.active-filters {
  background: #f8fafc;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.filter-tag {
  background: white;
  color: #667eea;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e0e7ff;
}

.remove-filter {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.remove-filter:hover {
  color: #ef4444;
}

/* Analytics Container */
.analytics-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.stat-icon {
  font-size: 32px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.analytics-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.analytics-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.small-select {
  padding: 8px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.small-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Top Categories Styles */
.top-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.top-category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-category-rank {
  width: 28px;
  height: 28px;
  background: #94a3b8;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.gold-rank {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.silver-rank {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
}

.bronze-rank {
  background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
  box-shadow: 0 2px 8px rgba(180, 83, 9, 0.3);
}

.top-category-info {
  flex: 1;
}

.top-category-name {
  display: block;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 6px;
  font-size: 14px;
}

.top-category-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.top-category-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.4s ease;
  border-radius: 3px;
}

.top-category-amount {
  font-weight: 600;
  color: #1e293b;
  min-width: 90px;
  text-align: right;
  font-size: 14px;
}

.top-categories-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid #e2e8f0;
}

.total-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 500;
}

.total-amount {
  font-weight: 700;
  color: #667eea;
  font-size: 16px;
}

.percentage {
  font-size: 14px;
  color: #64748b;
  text-align: right;
  font-weight: 500;
}

/* Spending by Category */
.spending-by-category {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spending-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.spending-header {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spending-category {
  flex: 1;
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
}

.spending-amount {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.spending-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spending-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.spending-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.spending-percent {
  font-size: 12px;
  color: #64748b;
  min-width: 35px;
  text-align: right;
}

/* Trend Chart */
.trend-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  min-height: 200px;
  padding: 20px 10px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 15px;
}

.trend-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 60px;
}

.bar-wrapper {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: flex-end;
}

.trend-bar {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 2px;
}

.trend-label {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}

.trend-stats {
  font-size: 14px;
  color: #1e293b;
  text-align: center;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

/* Expenses Dashboard */
.expenses-dashboard,
.budgets-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Chart Section */
.chart-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.chart-section h2 {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.donut-chart-container {
  max-width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart {
  width: 100%;
  height: auto;
}

.donut-segment {
  transition: stroke-dasharray 0.3s ease;
  cursor: pointer;
}

.donut-segment:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.donut-center-text {
  font-size: 20px;
  font-weight: 700;
  fill: #1e293b;
}

.donut-center-label {
  font-size: 10px;
  font-weight: 400;
  fill: #64748b;
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.legend-item:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.legend-item-active {
  background: #e0e7ff;
  border: 1px solid #667eea;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-label {
  flex: 1;
  color: #1e293b;
  font-weight: 500;
}

.legend-value {
  color: #64748b;
  font-weight: 600;
}

/* Budget Summary Stats */
.budget-summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.budget-stat {
  text-align: center;
}

.budget-stat .stat-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 5px;
}

.budget-stat .stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.text-danger {
  color: #ef4444;
}

/* Section Styles */
.section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

input, select {
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  background: white;
}

input:focus, select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #1e293b;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.btn-edit {
  background: #e0e7ff;
  color: #667eea;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-edit:hover {
  background: #c7d2fe;
}

.btn-delete {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Expenses List */
.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  flex-wrap: wrap;
  gap: 10px;
}

.expense-info {
  flex: 1;
  min-width: 200px;
}

.expense-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 4px;
}

.expense-header strong {
  color: #1e293b;
  font-size: 15px;
}

.category-badge {
  background: #e0e7ff;
  color: #667eea;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.expense-item small {
  color: #64748b;
  font-size: 12px;
}

.expense-amount {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  min-width: 100px;
  text-align: right;
}

.expense-actions {
  display: flex;
  gap: 8px;
}

.total {
  margin-top: 20px;
  padding: 15px 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: right;
  color: #1e293b;
  font-size: 16px;
  border-left: 4px solid #667eea;
}

/* Budgets List */
.budgets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.budget-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.budget-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.budget-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.budget-header small {
  color: #64748b;
  font-size: 12px;
}

.budget-progress {
  margin-bottom: 15px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.budget-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.budget-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}



/* Loading and No Data */
.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 15px;
}

/* Floating Action Button */
.fab {
  position: fixed;
  right: 25px;
  bottom: 25px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: 500px;
  max-width: 90%;
  background: white;
  border-radius: 16px;
  padding: 35px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-card h3 {
  margin: 0 0 25px 0;
  font-size: 24px;
  color: #1e293b;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .btn-clear {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .trend-container {
    gap: 4px;
  }
  
  .trend-column {
    max-width: 40px;
  }

  .chart-legend {
    grid-template-columns: 1fr;
  }

  .budget-summary-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>