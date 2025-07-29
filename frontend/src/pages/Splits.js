import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { splitsAPI, testAPI } from '../services/api';

const Splits = () => {
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, paid, settled

  useEffect(() => {
    fetchSplits();
  }, []);

  const fetchSplits = async () => {
    try {
      setLoading(true);
      // Get all splits by fetching from all groups
      const groupsResponse = await testAPI.getDataSummary();
      const groups = groupsResponse.data.groups || [];
      
      const allSplits = [];
      for (const group of groups) {
        try {
          const groupSplitsResponse = await testAPI.getGroupSplits(group.id);
          if (groupSplitsResponse.data.pendingSplits) {
            allSplits.push(...groupSplitsResponse.data.pendingSplits);
          }
        } catch (err) {
          console.error(`Error fetching splits for group ${group.id}:`, err);
        }
      }
      
      setSplits(allSplits);
    } catch (err) {
      setError('Failed to load splits');
      console.error('Splits error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (splitId) => {
    try {
      await splitsAPI.markSplitAsPaid(splitId);
      fetchSplits(); // Refresh the list
    } catch (err) {
      console.error('Mark as paid error:', err);
      alert('Failed to mark split as paid');
    }
  };

  const handleMarkAsSettled = async (splitId) => {
    try {
      await splitsAPI.markSplitAsSettled(splitId);
      fetchSplits(); // Refresh the list
    } catch (err) {
      console.error('Mark as settled error:', err);
      alert('Failed to mark split as settled');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-warning-500" />;
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'SETTLED':
        return <CheckCircle className="w-4 h-4 text-primary-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning-100 text-warning-800';
      case 'PAID':
        return 'bg-success-100 text-success-800';
      case 'SETTLED':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSplits = splits.filter(split => {
    if (filter === 'all') return true;
    return split.status === filter.toUpperCase();
  });

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
            <DollarSign className="h-5 w-5 text-red-400" />
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
          <h1 className="text-3xl font-bold text-gray-900">Splits</h1>
          <p className="mt-2 text-gray-600">Manage expense splits and payments in SettleUp</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Splits</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="settled">Settled</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Splits</p>
              <p className="text-2xl font-semibold text-gray-900">{splits.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-warning-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {splits.filter(s => s.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="text-2xl font-semibold text-gray-900">
                {splits.filter(s => s.status === 'PAID').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Settled</p>
              <p className="text-2xl font-semibold text-gray-900">
                {splits.filter(s => s.status === 'SETTLED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Splits List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Splits</h2>
          <p className="text-sm text-gray-600">{filteredSplits.length} splits found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSplits.map((split) => (
                <tr 
                  key={split.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedSplit?.id === split.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setSelectedSplit(split)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {split.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{split.user?.name}</div>
                        <div className="text-sm text-gray-500">ID: {split.user?.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {split.expense?.description || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid by {split.expense?.paidBy?.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{split.expense?.group?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(split.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(split.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(split.status)}`}>
                        {split.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {split.status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(split.id);
                            }}
                            className="text-success-600 hover:text-success-900"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsSettled(split.id);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Mark Settled
                          </button>
                        </>
                      )}
                      <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Split Details Sidebar */}
      {selectedSplit && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Split Details</h2>
              <button 
                onClick={() => setSelectedSplit(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">User</h3>
                <p className="text-sm text-gray-600">{selectedSplit.user?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">Expense</h3>
                <p className="text-sm text-gray-600">{selectedSplit.expense?.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">Group</h3>
                <p className="text-sm text-gray-600">{selectedSplit.expense?.group?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">Amount</h3>
                <p className="text-sm text-gray-600">{formatCurrency(selectedSplit.amount)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">Status</h3>
                <div className="flex items-center mt-1">
                  {getStatusIcon(selectedSplit.status)}
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSplit.status)}`}>
                    {selectedSplit.status}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">Split Type</h3>
                <p className="text-sm text-gray-600">{selectedSplit.splitType}</p>
              </div>
              
              {selectedSplit.status === 'PENDING' && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleMarkAsPaid(selectedSplit.id)}
                      className="w-full bg-success-600 text-white px-3 py-2 rounded-md text-sm hover:bg-success-700"
                    >
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => handleMarkAsSettled(selectedSplit.id)}
                      className="w-full bg-primary-600 text-white px-3 py-2 rounded-md text-sm hover:bg-primary-700"
                    >
                      Mark as Settled
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Splits; 