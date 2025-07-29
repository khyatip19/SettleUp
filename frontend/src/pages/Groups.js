import React, { useState, useEffect } from 'react';
import { Split, Plus, Users, CreditCard, Eye } from 'lucide-react';
import { groupsAPI, testAPI } from '../services/api';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSplits, setGroupSplits] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupSplits = async (groupId) => {
    try {
      const response = await testAPI.getGroupSplits(groupId);
      setGroupSplits(response.data);
    } catch (err) {
      console.error('Group splits error:', err);
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    fetchGroupSplits(group.id);
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
            <Split className="h-5 w-5 text-red-400" />
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
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="mt-2 text-gray-600">Manage groups and their members in SettleUp</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Groups</h2>
              <p className="text-sm text-gray-600">{groups.length} groups found</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((group) => (
                    <tr 
                      key={group.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedGroup?.id === group.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleGroupClick(group)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-success-100 flex items-center justify-center">
                              <Split className="h-5 w-5 text-success-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{group.name}</div>
                            <div className="text-sm text-gray-500">ID: {group.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{group.members?.length || 0} members</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {group.members?.slice(0, 3).map(member => member.name).join(', ')}
                          {group.members?.length > 3 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Group Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedGroup ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Group Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
                    <Split className="h-8 w-8 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-500">{selectedGroup.members?.length || 0} members</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Members</h4>
                  <div className="space-y-2">
                    {selectedGroup.members?.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {groupSplits && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Expenses</h4>
                    <div className="space-y-2">
                      {groupSplits.expenses?.slice(0, 3).map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center text-sm">
                          <div>
                            <div className="font-medium text-gray-900">{expense.description}</div>
                            <div className="text-gray-500">Paid by {expense.paidBy?.name}</div>
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full bg-primary-600 text-white px-3 py-2 rounded-md text-sm hover:bg-primary-700 flex items-center justify-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Add Expense</span>
                    </button>
                    <button className="w-full bg-success-600 text-white px-3 py-2 rounded-md text-sm hover:bg-success-700 flex items-center justify-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Add Member</span>
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200">
                      Edit Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Split className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No group selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click on a group to view its details, members, and expenses.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups; 