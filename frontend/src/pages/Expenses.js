import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Users, Split } from 'lucide-react';
import { expensesAPI, groupsAPI, usersAPI } from '../services/api';

const SPLIT_TYPES = [
  { value: 'EQUAL', label: 'Equal' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'CUSTOM', label: 'Custom' },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    groupId: '',
    paidById: '',
    amount: '',
    description: ''
  });
  const [splitType, setSplitType] = useState('EQUAL');
  const [splitDetails, setSplitDetails] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Reset split details when group or split type changes
    if (formData.groupId) {
      const group = groups.find(g => g.id === parseInt(formData.groupId));
      if (group) {
        setSplitDetails(group.members.map(member => ({
          userId: member.id,
          amount: '',
          percentage: '',
          name: member.name,
        })));
      }
    } else {
      setSplitDetails([]);
    }
  }, [formData.groupId, splitType, groups]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, groupsRes, usersRes] = await Promise.all([
        expensesAPI.getAll(),
        groupsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setExpenses(expensesRes.data);
      setGroups(groupsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSplitDetailChange = (idx, field, value) => {
    setSplitDetails(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setFormError('');
    // Validation
    if (splitType === 'PERCENTAGE') {
      const percentages = splitDetails.map(d => parseFloat(d.percentage));
      if (percentages.some(p => isNaN(p) || p <= 0)) {
        setFormError('All percentages must be greater than 0.');
        return;
      }
      const total = percentages.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) > 0.01) {
        setFormError('Percentages must sum to 100.');
        return;
      }
    } else if (splitType === 'CUSTOM') {
      const amounts = splitDetails.map(d => parseFloat(d.amount));
      if (amounts.some(a => isNaN(a) || a <= 0)) {
        setFormError('All amounts must be greater than 0.');
        return;
      }
      const total = amounts.reduce((a, b) => a + b, 0);
      if (Math.abs(total - parseFloat(formData.amount)) > 0.01) {
        setFormError('Custom amounts must sum to the total amount.');
        return;
      }
    }
    try {
      const splits = splitDetails.map(detail => {
        if (splitType === 'EQUAL') {
          return { userId: detail.userId };
        } else if (splitType === 'PERCENTAGE') {
          return { userId: detail.userId, percentage: parseFloat(detail.percentage) };
        } else if (splitType === 'CUSTOM') {
          return { userId: detail.userId, amount: parseFloat(detail.amount) };
        }
        return null;
      });
      const reqBody = {
        groupId: parseInt(formData.groupId),
        paidById: parseInt(formData.paidById),
        amount: parseFloat(formData.amount),
        description: formData.description,
        splitType,
        splits,
      };
      await expensesAPI.addExpenseFlexible(reqBody);
      setShowAddForm(false);
      setFormData({ groupId: '', paidById: '', amount: '', description: '' });
      setSplitType('EQUAL');
      setSplitDetails([]);
      fetchData();
    } catch (err) {
      console.error('Add expense error:', err);
      setFormError('Failed to add expense. Please check your input.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-2 text-gray-600">Manage and track all expenses in SettleUp</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Add New Expense</h2>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {formError && (
            <div className="mb-4 text-red-600 bg-red-100 border border-red-200 rounded p-2">
              {formError}
            </div>
          )}
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <select
                  required
                  value={formData.groupId}
                  onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid By
                </label>
                <select
                  required
                  value={formData.paidById}
                  onChange={(e) => setFormData({...formData, paidById: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select who paid</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="What was this expense for?"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Split Type</label>
              <select
                value={splitType}
                onChange={e => setSplitType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SPLIT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            {splitType === 'EQUAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Split Equally Among</label>
                <ul>
                  {splitDetails.map((detail, idx) => (
                    <li key={detail.userId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="mr-2"
                      />
                      <span>{detail.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {splitType === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Percentage for Each User</label>
                <ul>
                  {splitDetails.map((detail, idx) => (
                    <li key={detail.userId} className="flex items-center space-x-2 mb-1">
                      <span className="w-24">{detail.name}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={detail.percentage}
                        onChange={e => handleSplitDetailChange(idx, 'percentage', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="%"
                        required
                      />
                      <span>%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {splitType === 'CUSTOM' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Amount for Each User</label>
                <ul>
                  {splitDetails.map((detail, idx) => (
                    <li key={detail.userId} className="flex items-center space-x-2 mb-1">
                      <span className="w-24">{detail.name}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={detail.amount}
                        onChange={e => handleSplitDetailChange(idx, 'amount', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="$"
                        required
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Expenses</h2>
          <p className="text-sm text-gray-600">{expenses.length} expenses found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Splits
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                      <div className="text-sm text-gray-500">ID: {expense.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                          <Split className="h-4 w-4 text-success-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{expense.group?.name}</div>
                        <div className="text-sm text-gray-500">{expense.group?.members?.length || 0} members</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {expense.paidBy?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{expense.paidBy?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{expense.splits?.length || 0} splits</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {expense.splits?.slice(0, 2).map(split => split.user?.name).join(', ')}
                      {expense.splits?.length > 2 && '...'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses; 