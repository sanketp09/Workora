import React, { useState, useEffect } from 'react';
import { Shield, Download, Search, Filter, Calendar, User, Activity, Eye, ChevronDown, ChevronUp, FileText, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([
    {
      id: 'LOG-1048',
      action: 'System settings changed',
      actionType: 'update',
      entityAffected: 'Neha Gupta',
      entityType: 'employee',
      changedBy: 'System',
      timestamp: '2026-01-30T16:03:00',
      changes: { setting: 'Auto-approval', from: 'Disabled', to: 'Enabled' },
      ipAddress: '192.168.1.100',
      category: 'system'
    },
    {
      id: 'LOG-1022',
      action: 'Leave request rejected',
      actionType: 'delete',
      entityAffected: 'Anjali Mehta',
      entityType: 'leave',
      changedBy: 'Ravindra Singh (Admin)',
      timestamp: '2026-01-29T16:47:00',
      changes: { status: 'Pending', to: 'Rejected', reason: 'Critical project deadline' },
      ipAddress: '192.168.1.105',
      category: 'leave'
    },
    {
      id: 'LOG-1029',
      action: 'Employee account disabled',
      actionType: 'delete',
      entityAffected: 'Vikram Patel',
      entityType: 'employee',
      changedBy: 'Ravindra Singh (Admin)',
      timestamp: '2026-01-28T15:50:00',
      changes: { status: 'Active', to: 'Disabled', reason: 'Contract ended' },
      ipAddress: '192.168.1.105',
      category: 'employee'
    },
    {
      id: 'LOG-1007',
      action: 'Employee account disabled',
      actionType: 'delete',
      entityAffected: 'Vikram Patel',
      entityType: 'employee',
      changedBy: 'Priya Sharma (HR)',
      timestamp: '2026-01-28T09:16:00',
      changes: { status: 'Active', to: 'Disabled' },
      ipAddress: '192.168.1.110',
      category: 'employee'
    },
    {
      id: 'LOG-1012',
      action: 'Employee account disabled',
      actionType: 'delete',
      entityAffected: 'Vikram Patel',
      entityType: 'employee',
      changedBy: 'Ravindra Singh (Admin)',
      timestamp: '2026-01-27T14:31:00',
      changes: { status: 'Active', to: 'Disabled' },
      ipAddress: '192.168.1.105',
      category: 'employee'
    },
    {
      id: 'LOG-1041',
      action: 'Employee account created',
      actionType: 'create',
      entityAffected: 'Neha Gupta',
      entityType: 'employee',
      changedBy: 'Ravindra Singh (Admin)',
      timestamp: '2026-01-27T11:47:00',
      changes: { role: 'Employee', department: 'Engineering' },
      ipAddress: '192.168.1.105',
      category: 'employee'
    },
    {
      id: 'LOG-1014',
      action: 'Leave request rejected',
      actionType: 'delete',
      entityAffected: 'Neha Gupta',
      entityType: 'leave',
      changedBy: 'Ravindra Singh (Admin)',
      timestamp: '2026-01-26T15:00:00',
      changes: { status: 'Pending', to: 'Rejected', reason: 'Critical project deadline' },
      ipAddress: '192.168.1.105',
      category: 'leave'
    },
    {
      id: 'LOG-1003',
      action: 'Salary updated',
      actionType: 'update',
      entityAffected: 'Rahul Kumar',
      entityType: 'salary',
      changedBy: 'Priya Sharma (HR)',
      timestamp: '2026-01-26T10:22:00',
      changes: { salary: '₹45,000', to: '₹50,000' },
      ipAddress: '192.168.1.110',
      category: 'salary'
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    actionType: 'all',
    entityType: 'all',
    dateFrom: '2026-01-01',
    dateTo: '2026-01-31',
    category: 'all'
  });

  const [expandedLog, setExpandedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate statistics
  const totalActions = logs.length;
  const thisMonth = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  }).length;

  const salaryChanges = logs.filter(log => log.category === 'salary').length;
  const employeeChanges = logs.filter(log => log.category === 'employee').length;

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
                       log.entityAffected.toLowerCase().includes(filters.search.toLowerCase()) ||
                       log.changedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
                       log.id.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchActionType = filters.actionType === 'all' || log.actionType === filters.actionType;
    const matchEntityType = filters.entityType === 'all' || log.entityType === filters.entityType;
    const matchCategory = filters.category === 'all' || log.category === filters.category;
    
    const logDate = new Date(log.timestamp);
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);
    const matchDate = logDate >= fromDate && logDate <= toDate;

    return matchSearch && matchActionType && matchEntityType && matchCategory && matchDate;
  });

  const getActionIcon = (actionType) => {
    switch(actionType) {
      case 'create': return <CheckCircle className="text-green-600" size={18} />;
      case 'update': return <AlertCircle className="text-blue-600" size={18} />;
      case 'delete': return <XCircle className="text-red-600" size={18} />;
      default: return <Activity className="text-gray-600" size={18} />;
    }
  };

  const getActionBadge = (actionType) => {
    const styles = {
      create: 'bg-green-100 text-green-800 border-green-200',
      update: 'bg-blue-100 text-blue-800 border-blue-200',
      delete: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[actionType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryBadge = (category) => {
    const styles = {
      employee: 'bg-purple-100 text-purple-800',
      salary: 'bg-yellow-100 text-yellow-800',
      leave: 'bg-orange-100 text-orange-800',
      attendance: 'bg-cyan-100 text-cyan-800',
      system: 'bg-indigo-100 text-indigo-800'
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const exportLogs = () => {
    const csvContent = [
      ['Log ID', 'Action', 'Entity Affected', 'Changed By', 'Timestamp', 'Changes'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.action,
        log.entityAffected,
        log.changedBy,
        log.timestamp,
        JSON.stringify(log.changes)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-600 text-sm">Track all system changes for compliance & transparency</p>
              </div>
            </div>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              <Download size={18} />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Actions</span>
              <Activity className="text-blue-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalActions}</div>
            <p className="text-xs text-gray-500 mt-1">All time activity</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">This Month</span>
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{thisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">January 2026</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Salary Changes</span>
              <FileText className="text-yellow-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{salaryChanges}</div>
            <p className="text-xs text-gray-500 mt-1">Payroll updates</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Employee Changes</span>
              <User className="text-green-600" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{employeeChanges}</div>
            <p className="text-xs text-gray-500 mt-1">Profile modifications</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by employee, admin, or log ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
              >
                <Filter size={18} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select
                    value={filters.actionType}
                    onChange={(e) => setFilters({...filters, actionType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Actions</option>
                    <option value="create">Created</option>
                    <option value="update">Updated</option>
                    <option value="delete">Deleted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                  <select
                    value={filters.entityType}
                    onChange={(e) => setFilters({...filters, entityType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Entities</option>
                    <option value="employee">Employee</option>
                    <option value="salary">Salary</option>
                    <option value="leave">Leave</option>
                    <option value="attendance">Attendance</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="employee">Employee</option>
                    <option value="salary">Salary</option>
                    <option value="leave">Leave</option>
                    <option value="attendance">Attendance</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Log ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Entity Affected</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Changed By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{log.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getActionIcon(log.actionType)}
                          <div>
                            <div className={`text-sm font-medium px-3 py-1 rounded-full border inline-block ${getActionBadge(log.actionType)}`}>
                              {log.action}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{log.entityAffected}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{log.changedBy}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{formatTimestamp(log.timestamp).date}</div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(log.timestamp).time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryBadge(log.category)}`}>
                          {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm"
                        >
                          <Eye size={16} />
                          {expandedLog === log.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <FileText size={18} className="text-blue-600" />
                              Change Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-blue-200">
                              {Object.entries(log.changes).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-3">
                                  <span className="text-sm font-medium text-gray-600 min-w-24">{key}:</span>
                                  <span className="text-sm text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                </div>
                              ))}
                              <div className="flex items-start gap-3">
                                <span className="text-sm font-medium text-gray-600 min-w-24">IP Address:</span>
                                <span className="text-sm text-gray-900 font-mono">{log.ipAddress}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No audit logs found matching your filters</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredLogs.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredLogs.length} of {totalActions} total logs
          </div>
        )}
      </div>
    </div>
  );
}
