import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface IGroup {
  _id: string;
  name: string;
  description: string;
  enrollmentCode: string;
  students: Array<{ _id: string; email: string; firstName?: string; lastName?: string }>;
  exams: Array<{ _id: string; title: string; isLive: boolean }>;
  isPublic: boolean;
  password?: string;
  maxStudents?: number;
  tags: string[];
  settings: {
    allowSelfEnrollment: boolean;
    requireApproval: boolean;
    emailNotifications: boolean;
  };
  analytics: {
    totalStudents: number;
    activeStudents: number;
    completedExams: number;
    averageScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ICreateGroupData {
  name: string;
  description: string;
  isPublic: boolean;
  password: string;
  maxStudents: number | null;
  tags: string[];
  settings: {
    allowSelfEnrollment: boolean;
    requireApproval: boolean;
    emailNotifications: boolean;
  };
}

const EnhancedGroupManager: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'created'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Create Group Form
  const [createGroupData, setCreateGroupData] = useState<ICreateGroupData>({
    name: '',
    description: '',
    isPublic: false,
    password: '',
    maxStudents: null,
    tags: [],
    settings: {
      allowSelfEnrollment: true,
      requireApproval: false,
      emailNotifications: true,
    },
  });
  
  const [newTag, setNewTag] = useState<string>('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/groups/creator`);
      setGroups(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createGroupData.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/groups/create`, createGroupData);
      setGroups([...groups, response.data]);
      setShowCreateModal(false);
      setCreateGroupData({
        name: '',
        description: '',
        isPublic: false,
        password: '',
        maxStudents: null,
        tags: [],
        settings: {
          allowSelfEnrollment: true,
          requireApproval: false,
          emailNotifications: true,
        },
      });
      setSuccess('Group created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/groups/${groupId}`);
      setGroups(groups.filter(g => g._id !== groupId));
      setSuccess('Group deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGroups.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedGroups.length} groups? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(selectedGroups.map(id => axios.delete(`${API_URL}/api/groups/${id}`)));
      setGroups(groups.filter(g => !selectedGroups.includes(g._id)));
      setSelectedGroups([]);
      setSuccess(`${selectedGroups.length} groups deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to delete some groups');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !createGroupData.tags.includes(newTag.trim())) {
      setCreateGroupData({
        ...createGroupData,
        tags: [...createGroupData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCreateGroupData({
      ...createGroupData,
      tags: createGroupData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectAllGroups = () => {
    setSelectedGroups(filteredGroups.map(g => g._id));
  };

  const deselectAllGroups = () => {
    setSelectedGroups([]);
  };

  // Filter and sort groups
  const filteredGroups = groups
    .filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !filterTag || group.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'students':
          return b.analytics.totalStudents - a.analytics.totalStudents;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Get all unique tags
  const allTags = Array.from(new Set(groups.flatMap(g => g.tags)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Group Management</h1>
              <p className="text-gray-400 mt-1">Manage your student groups and assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/creator/dashboard')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
              >
                Dashboard
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md transition duration-150 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Alerts */}
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={() => setError(null)} className="float-right text-red-300 hover:text-red-100">×</button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded mb-6">
            {success}
            <button onClick={() => setSuccess(null)} className="float-right text-green-300 hover:text-green-100">×</button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'students' | 'created')}
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="name">Sort by Name</option>
                <option value="students">Sort by Students</option>
                <option value="created">Sort by Created</option>
              </select>
            </div>

            {/* View Mode and Bulk Actions */}
            <div className="flex items-center space-x-4">
              {selectedGroups.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{selectedGroups.length} selected</span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={deselectAllGroups}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                  >
                    Deselect All
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {filteredGroups.length > 0 && (
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={selectAllGroups}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Select All ({filteredGroups.length})
              </button>
              <span className="text-sm text-gray-400">
                Showing {filteredGroups.length} of {groups.length} groups
              </span>
            </div>
          )}
        </div>

        {/* Groups Display */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No groups found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterTag ? 'Try adjusting your search or filter criteria.' : 'Create your first group to get started.'}
            </p>
            {!searchTerm && !filterTag && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md transition duration-150"
              >
                Create Your First Group
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group._id)}
                        onChange={() => toggleGroupSelection(group._id)}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                        {group.isPublic && (
                          <span className="inline-block px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/creator/groups/${group._id}`)}
                        className="p-2 text-gray-400 hover:text-white"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group._id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                        title="Delete Group"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                  
                  {/* Tags */}
                  {group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {group.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-400">{group.analytics.totalStudents}</div>
                      <div className="text-xs text-gray-400">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{group.exams.length}</div>
                      <div className="text-xs text-gray-400">Exams</div>
                    </div>
                  </div>
                  
                  {/* Enrollment Code */}
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-xs text-gray-400 mb-1">Enrollment Code</div>
                    <div className="font-mono text-lg text-white">{group.enrollmentCode}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                        onChange={selectedGroups.length === filteredGroups.length ? deselectAllGroups : selectAllGroups}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredGroups.map((group) => (
                    <tr key={group._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group._id)}
                          onChange={() => toggleGroupSelection(group._id)}
                          className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{group.name}</div>
                          <div className="text-sm text-gray-400">{group.description}</div>
                          {group.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {group.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {group.analytics.totalStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {group.exams.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-white bg-gray-700 px-2 py-1 rounded">
                          {group.enrollmentCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/creator/groups/${group._id}`)}
                            className="text-primary-400 hover:text-primary-300"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Group</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={createGroupData.name}
                      onChange={(e) => setCreateGroupData({ ...createGroupData, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter group name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={createGroupData.description}
                      onChange={(e) => setCreateGroupData({ ...createGroupData, description: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter group description"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={createGroupData.isPublic}
                        onChange={(e) => setCreateGroupData({ ...createGroupData, isPublic: e.target.checked })}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                        Public Group
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowSelfEnrollment"
                        checked={createGroupData.settings.allowSelfEnrollment}
                        onChange={(e) => setCreateGroupData({
                          ...createGroupData,
                          settings: { ...createGroupData.settings, allowSelfEnrollment: e.target.checked }
                        })}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="allowSelfEnrollment" className="ml-2 text-sm text-gray-300">
                        Allow Self Enrollment
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        checked={createGroupData.settings.requireApproval}
                        onChange={(e) => setCreateGroupData({
                          ...createGroupData,
                          settings: { ...createGroupData.settings, requireApproval: e.target.checked }
                        })}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-300">
                        Require Approval
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={createGroupData.settings.emailNotifications}
                        onChange={(e) => setCreateGroupData({
                          ...createGroupData,
                          settings: { ...createGroupData.settings, emailNotifications: e.target.checked }
                        })}
                        className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-300">
                        Email Notifications
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={createGroupData.password}
                        onChange={(e) => setCreateGroupData({ ...createGroupData, password: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter group password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Students (Optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={createGroupData.maxStudents || ''}
                        onChange={(e) => setCreateGroupData({ 
                          ...createGroupData, 
                          maxStudents: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Tags</h4>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white"
                    >
                      Add
                    </button>
                  </div>
                  
                  {createGroupData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {createGroupData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-gray-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGroupManager; 