"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity as ActivityIcon, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  Trash2,
  Archive
} from 'lucide-react';
import {
  Activity,
  ActivityFilter,
  ActivityType,
  ActivitySeverity,
  ActivityStatus,
  getActivityTypeLabel,
  getActivitySeverityColor,
  getActivityStatusColor,
  formatActivityTimestamp
} from '../../types/activity';

interface ActivityLoggerProps {
  activities?: Activity[];
  loading?: boolean;
  onLoadMore?: () => void;
  onExport?: (format: 'csv' | 'json' | 'xlsx') => void;
  onDeleteActivity?: (activityId: string) => void;
  onArchiveActivity?: (activityId: string) => void;
  className?: string;
}

// Mock data for demonstration
const generateMockActivities = (): Activity[] => {
  const mockUsers = [
    { _id: '1', name: 'John Admin', email: 'john@barbies.com', role: 'admin' as const },
    { _id: '2', name: 'Sarah Manager', email: 'sarah@barbies.com', role: 'manager' as const },
    { _id: '3', name: 'Mike Staff', email: 'mike@barbies.com', role: 'user' as const }
  ];

  const activityTypes: ActivityType[] = [
    'user_action', 'system_event', 'booking_change', 'order_update', 
    'product_change', 'payment_event', 'auth_event', 'security_alert'
  ];

  const activities: Activity[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const randomDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const user = type === 'system_event' ? null : mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    activities.push({
      _id: `activity_${i + 1}`,
      type,
      action: `${type}.${['created', 'updated', 'deleted', 'viewed'][Math.floor(Math.random() * 4)]}`,
      description: getActivityDescription(type, i),
      user,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as ActivitySeverity,
      status: ['success', 'warning', 'error', 'info'][Math.floor(Math.random() * 4)] as ActivityStatus,
      metadata: {
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        entity_id: `entity_${Math.floor(Math.random() * 100)}`,
        entity_type: ['product', 'order', 'booking', 'user'][Math.floor(Math.random() * 4)],
        duration_ms: Math.floor(Math.random() * 5000)
      },
      timestamp: randomDate.toISOString(),
      created_at: randomDate.toISOString(),
      updated_at: randomDate.toISOString()
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getActivityDescription = (type: ActivityType, index: number): string => {
  const descriptions: Record<ActivityType, string[]> = {
    user_action: [`Created new user account`, `Updated user profile`, `Deleted user account`, `Changed user permissions`],
    system_event: [`System backup completed`, `Database optimization finished`, `Cache cleared`, `System maintenance started`],
    booking_change: [`New booking scheduled`, `Booking rescheduled`, `Staff assigned to booking`, `Booking cancelled`],
    order_update: [`Order status updated to processing`, `Order shipped`, `Order cancelled`, `Refund processed`],
    product_change: [`Product added to catalog`, `Product price updated`, `Product removed`, `Inventory restocked`],
    payment_event: [`Payment processed`, `Refund issued`, `Payment failed`, `Subscription renewed`],
    auth_event: [`User logged in`, `User logged out`, `Password changed`, `Two-factor authentication enabled`],
    security_alert: [`Suspicious login detected`, `Multiple failed login attempts`, `IP address blocked`, `Unauthorized access attempt`],
    data_export: [`Customer data exported`, `Sales report generated`, `Audit log exported`, `Backup downloaded`],
    configuration_change: [`Settings updated`, `Feature flag toggled`, `API key rotated`, `Webhook configured`]
  };
  
  const typeDescriptions = descriptions[type] || ['Activity occurred'];
  return typeDescriptions[index % typeDescriptions.length];
};

const ActivityLogger: React.FC<ActivityLoggerProps> = ({
  activities = generateMockActivities(),
  loading = false,
  onLoadMore,
  onExport,
  onDeleteActivity,
  onArchiveActivity,
  className = ""
}) => {
  const [filters, setFilters] = useState<ActivityFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Apply type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(activity => filters.type!.includes(activity.type));
    }

    // Apply severity filter
    if (filters.severity && filters.severity.length > 0) {
      filtered = filtered.filter(activity => filters.severity!.includes(activity.severity));
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(activity => filters.status!.includes(activity.status));
    }

    // Apply user filter
    if (filters.user_id && filters.user_id.length > 0) {
      filtered = filtered.filter(activity => 
        activity.user && filters.user_id!.includes(activity.user._id)
      );
    }

    // Apply date range filter
    if (filters.date_from) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= new Date(filters.date_from!)
      );
    }
    if (filters.date_to) {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) <= new Date(filters.date_to!)
      );
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(search) ||
        activity.action.toLowerCase().includes(search) ||
        activity.user?.name.toLowerCase().includes(search) ||
        activity.user?.email.toLowerCase().includes(search) ||
        getActivityTypeLabel(activity.type).toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [activities, filters, searchTerm]);

  // Pagination
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedActivities.length === paginatedActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(paginatedActivities.map(activity => activity._id));
    }
  };

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const getActivityIcon = (type: ActivityType, status: ActivityStatus) => {
    if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />;
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    
    switch (type) {
      case 'user_action': return <User className="h-4 w-4 text-blue-500" />;
      case 'system_event': return <ActivityIcon className="h-4 w-4 text-purple-500" />;
      case 'security_alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'auth_event': return <User className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Activity Log
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredActivities.length} activities {searchTerm && `matching "${searchTerm}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline btn-sm ${showFilters ? 'bg-accent' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            {onExport && (
              <div className="relative group">
                <button className="btn-outline btn-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => onExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => onExport('json')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => onExport('xlsx')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities, users, actions..."
              className="input pl-10 w-full sm:w-80 lg:w-96"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-accent/20 rounded-lg border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Activity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Activity Type</label>
                <select
                  multiple
                  value={filters.type || []}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    type: Array.from(e.target.selectedOptions, option => option.value as ActivityType)
                  }))}
                  className="input text-sm h-32"
                >
                  <option value="user_action">User Action</option>
                  <option value="system_event">System Event</option>
                  <option value="booking_change">Booking Change</option>
                  <option value="order_update">Order Update</option>
                  <option value="product_change">Product Change</option>
                  <option value="payment_event">Payment Event</option>
                  <option value="auth_event">Authentication</option>
                  <option value="security_alert">Security Alert</option>
                  <option value="data_export">Data Export</option>
                  <option value="configuration_change">Configuration</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Severity</label>
                <select
                  multiple
                  value={filters.severity || []}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    severity: Array.from(e.target.selectedOptions, option => option.value as ActivitySeverity)
                  }))}
                  className="input text-sm h-32"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: Array.from(e.target.selectedOptions, option => option.value as ActivityStatus)
                  }))}
                  className="input text-sm h-32"
                >
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                    className="input text-sm w-full"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                    className="input text-sm w-full"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={resetFilters}
                className="btn-outline btn-sm text-muted-foreground"
              >
                Clear Filters
              </button>
              <div className="text-sm text-muted-foreground">
                {filteredActivities.length} of {activities.length} activities
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedActivities.length > 0 && (
        <div className="px-6 py-3 bg-accent/10 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedActivities.length} selected
            </span>
            <div className="flex items-center gap-2">
              {onArchiveActivity && (
                <button
                  onClick={() => {
                    selectedActivities.forEach(id => onArchiveActivity(id));
                    setSelectedActivities([]);
                  }}
                  className="btn-outline btn-sm"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </button>
              )}
              {onDeleteActivity && (
                <button
                  onClick={() => {
                    selectedActivities.forEach(id => onDeleteActivity(id));
                    setSelectedActivities([]);
                  }}
                  className="btn-outline btn-sm text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading activities...</p>
          </div>
        ) : paginatedActivities.length === 0 ? (
          <div className="p-8 text-center">
            <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              {searchTerm || Object.keys(filters).length > 0
                ? "Try adjusting your search or filters"
                : "Activities will appear here as they occur"}
            </p>
          </div>
        ) : (
          paginatedActivities.map((activity) => (
            <div key={activity._id} className="p-4 hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-4">
                {/* Selection checkbox */}
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity._id)}
                  onChange={() => handleSelectActivity(activity._id)}
                  className="mt-1"
                />

                {/* Activity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type, activity.status)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {activity.description}
                        </h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getActivityTypeLabel(activity.type)}`}>
                            {getActivityTypeLabel(activity.type)}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getActivitySeverityColor(activity.severity)}`}>
                            {activity.severity}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getActivityStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        {activity.user && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="hidden sm:inline">{activity.user.name} ({activity.user.role})</span>
                            <span className="sm:hidden">{activity.user.name}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatActivityTimestamp(activity.timestamp)}
                        </span>
                        {activity.metadata.ip_address && (
                          <span className="hidden md:inline">IP: {activity.metadata.ip_address}</span>
                        )}
                        {activity.metadata.duration_ms && (
                          <span className="hidden lg:inline">Duration: {activity.metadata.duration_ms}ms</span>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {expandedActivity === activity._id && (
                        <div className="mt-3 p-3 bg-accent/10 rounded-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <h5 className="font-medium text-foreground mb-2">Details</h5>
                              <div className="space-y-1 text-muted-foreground">
                                <div><strong>Action:</strong> {activity.action}</div>
                                <div><strong>Timestamp:</strong> {new Date(activity.timestamp).toLocaleString()}</div>
                                {activity.metadata.entity_type && (
                                  <div><strong>Entity:</strong> {activity.metadata.entity_type}</div>
                                )}
                                {activity.metadata.entity_id && (
                                  <div><strong>Entity ID:</strong> {activity.metadata.entity_id}</div>
                                )}
                                {activity.metadata.session_id && (
                                  <div><strong>Session:</strong> {activity.metadata.session_id}</div>
                                )}
                              </div>
                            </div>
                            
                            {activity.metadata.changes && activity.metadata.changes.length > 0 && (
                              <div>
                                <h5 className="font-medium text-foreground mb-2">Changes</h5>
                                <div className="space-y-1 text-muted-foreground">
                                  {activity.metadata.changes.map((change, index) => (
                                    <div key={index} className="text-xs">{change}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activity.metadata.error_message && (
                              <div className="md:col-span-2">
                                <h5 className="font-medium text-foreground mb-2">Error Details</h5>
                                <div className="text-red-600 text-xs bg-red-50 p-2 rounded border">
                                  {activity.metadata.error_message}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedActivity(
                          expandedActivity === activity._id ? null : activity._id
                        )}
                        className="btn-ghost btn-icon btn-sm"
                        title={expandedActivity === activity._id ? "Collapse" : "Expand"}
                      >
                        {expandedActivity === activity._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      <div className="relative group">
                        <button className="btn-ghost btn-icon btn-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                            <Eye className="h-4 w-4 mr-2 inline" />
                            View Details
                          </button>
                          {onArchiveActivity && (
                            <button
                              onClick={() => onArchiveActivity(activity._id)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <Archive className="h-4 w-4 mr-2 inline" />
                              Archive
                            </button>
                          )}
                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(activity._id)}
                              className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4 mr-2 inline" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn-sm px-3 py-1 ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'btn-ghost'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load More */}
      {onLoadMore && currentPage === totalPages && (
        <div className="p-4 border-t border-border text-center">
          <button
            onClick={onLoadMore}
            className="btn-outline btn-sm"
          >
            Load More Activities
          </button>
        </div>
      )}

      {/* Select All Checkbox */}
      {paginatedActivities.length > 0 && (
        <div className="absolute top-[180px] left-6">
          <input
            type="checkbox"
            checked={selectedActivities.length === paginatedActivities.length}
            onChange={handleSelectAll}
            className="rounded border-border"
            title="Select all visible activities"
          />
        </div>
      )}
    </div>
  );
};

export default ActivityLogger;
