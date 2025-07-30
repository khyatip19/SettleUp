import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const usersAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (user) => api.post('/users', user),
    update: (id, user) => api.put(`/users/${id}`, user),
    delete: (id) => api.delete(`/users/${id}`),
};

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (group) => api.post('/groups', group),
  delete: (id) => api.delete(`/groups/${id}`),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members/${userId}`),
};

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expense'),
  getById: (id) => api.get(`/expense/${id}`),
  create: (expense) => api.post('/expense', expense),
  delete: (id) => api.delete(`/expense/${id}`),
  addExpense: (groupId, paidById, amount, description) => 
    api.post('/expense/add', null, {
      params: { groupId, paidById, amount, description }
    }),
  addExpenseFlexible: (expenseData) => api.post('/expense/flex', expenseData),
};

// Splits API
export const splitsAPI = {
  getByUser: (userId) => api.get(`/splits/user/${userId}`),
  getByExpense: (expenseId) => api.get(`/splits/expense/${expenseId}`),
  getUserBalanceInGroup: (userId, groupId) => api.get(`/splits/balance/user/${userId}/group/${groupId}`),
  getPendingByGroup: (groupId) => api.get(`/splits/pending/group/${groupId}`),
  markAsPaid: (splitId) => api.put(`/splits/${splitId}/mark-paid`),
  markAsSettled: (splitId) => api.put(`/splits/${splitId}/mark-settled`),
  updateAmount: (splitId, newAmount) => api.put(`/splits/${splitId}/amount`, null, {
    params: { newAmount }
  }),
  delete: (splitId) => api.delete(`/splits/${splitId}`),
  getTotalOwedByUser: (userId) => api.get(`/splits/total-owed/user/${userId}`),
  getByUserAndExpense: (userId, expenseId) => api.get(`/splits/user/${userId}/expense/${expenseId}`),
};

// Test API
export const testAPI = {
  getDataSummary: () => api.get('/test/data-summary'),
  getUserBalances: () => api.get('/test/user-balances'),
  getGroupSplits: (groupId) => api.get(`/test/group/${groupId}/splits`),
  testSplitCreation: () => api.get('/test/test-split-creation'),
};

export default api; 