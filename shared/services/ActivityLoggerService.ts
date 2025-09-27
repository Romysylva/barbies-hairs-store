// Activity Logger Service
import {
  Activity,
  ActivityType,
  ActivitySeverity,
  ActivityStatus,
  ActivityUser,
  ActivityMetadata,
  ActivityFilter,
  ActivityExportOptions,
  ACTIVITY_CONFIGS,
} from "../types/activity";

export interface LogActivityParams {
  type: ActivityType;
  action: string;
  description: string;
  user?: ActivityUser | null;
  target_user?: ActivityUser;
  severity?: ActivitySeverity;
  status?: ActivityStatus;
  metadata?: Partial<ActivityMetadata>;
}

class ActivityLoggerService {
  private activities: Activity[] = [];
  private subscribers: Array<(activities: Activity[]) => void> = [];
  private batchQueue: LogActivityParams[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 2000; // 2 seconds

  constructor() {
    // Initialize with some sample data
    this.loadInitialData();
  }

  /**
   * Log a single activity
   */
  async logActivity(params: LogActivityParams): Promise<Activity> {
    const activity: Activity = {
      _id: this.generateId(),
      type: params.type,
      action: params.action,
      description: params.description,
      user: params.user || null,
      target_user: params.target_user,
      severity: params.severity || "low",
      status: params.status || "success",
      metadata: {
        ip_address: await this.getClientIP(),
        user_agent: this.getUserAgent(),
        session_id: this.getSessionId(),
        request_id: this.generateRequestId(),
        timestamp: Date.now(),
        ...params.metadata,
      },
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.activities.unshift(activity);
    this.notifySubscribers();

    // Also send to external logging service in production
    await this.sendToExternalService(activity);

    return activity;
  }

  /**
   * Log multiple activities in batch
   */
  async logActivities(
    activitiesParams: LogActivityParams[]
  ): Promise<Activity[]> {
    const activities = await Promise.all(
      activitiesParams.map((params) => this.logActivity(params))
    );
    return activities;
  }

  /**
   * Add activity to batch queue for efficient bulk logging
   */
  queueActivity(params: LogActivityParams): void {
    this.batchQueue.push(params);

    // Process batch when it reaches size limit
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      this.processBatch();
    } else {
      // Set timer for delayed processing
      this.scheduleBatchProcessing();
    }
  }

  /**
   * Get activities with optional filtering
   */
  getActivities(filter?: ActivityFilter): Activity[] {
    let filtered = [...this.activities];

    if (!filter) return filtered;

    // Apply filters
    if (filter.type && filter.type.length > 0) {
      filtered = filtered.filter((activity) =>
        filter.type!.includes(activity.type)
      );
    }

    if (filter.severity && filter.severity.length > 0) {
      filtered = filtered.filter((activity) =>
        filter.severity!.includes(activity.severity)
      );
    }

    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter((activity) =>
        filter.status!.includes(activity.status)
      );
    }

    if (filter.user_id && filter.user_id.length > 0) {
      filtered = filtered.filter(
        (activity) =>
          activity.user && filter.user_id!.includes(activity.user._id)
      );
    }

    if (filter.date_from) {
      filtered = filtered.filter(
        (activity) =>
          new Date(activity.timestamp) >= new Date(filter.date_from!)
      );
    }

    if (filter.date_to) {
      filtered = filtered.filter(
        (activity) => new Date(activity.timestamp) <= new Date(filter.date_to!)
      );
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.description.toLowerCase().includes(search) ||
          activity.action.toLowerCase().includes(search) ||
          activity.user?.name.toLowerCase().includes(search) ||
          activity.user?.email.toLowerCase().includes(search)
      );
    }

    if (filter.entity_type) {
      filtered = filtered.filter(
        (activity) => activity.metadata.entity_type === filter.entity_type
      );
    }

    if (filter.entity_id) {
      filtered = filtered.filter(
        (activity) => activity.metadata.entity_id === filter.entity_id
      );
    }

    return filtered;
  }

  /**
   * Get activity by ID
   */
  getActivity(activityId: string): Activity | null {
    return (
      this.activities.find((activity) => activity._id === activityId) || null
    );
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string): Promise<boolean> {
    const index = this.activities.findIndex(
      (activity) => activity._id === activityId
    );
    if (index === -1) return false;

    // Log the deletion as an activity
    const deletedActivity = this.activities[index];
    await this.logActivity({
      type: "system_event",
      action: "activity.deleted",
      description: `Deleted activity: ${deletedActivity.description}`,
      severity: "medium",
      metadata: {
        deleted_activity_id: activityId,
        deleted_activity_type: deletedActivity.type,
      },
    });

    this.activities.splice(index, 1);
    this.notifySubscribers();
    return true;
  }

  /**
   * Archive activity
   */
  async archiveActivity(activityId: string): Promise<boolean> {
    const activity = this.getActivity(activityId);
    if (!activity) return false;

    // In a real implementation, this would move to archived storage
    // For now, we'll just mark it as archived in metadata
    activity.metadata.archived = true;
    activity.metadata.archived_at = new Date().toISOString();
    activity.updated_at = new Date().toISOString();

    await this.logActivity({
      type: "system_event",
      action: "activity.archived",
      description: `Archived activity: ${activity.description}`,
      severity: "low",
      metadata: {
        archived_activity_id: activityId,
      },
    });

    this.notifySubscribers();
    return true;
  }

  /**
   * Export activities
   */
  async exportActivities(options: ActivityExportOptions): Promise<string> {
    const activities = this.getActivities(options.filters);

    // Filter by date range if specified
    let filteredActivities = activities;
    if (options.date_range) {
      filteredActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        return (
          activityDate >= new Date(options.date_range!.start) &&
          activityDate <= new Date(options.date_range!.end)
        );
      });
    }

    // Log the export activity
    await this.logActivity({
      type: "data_export",
      action: "activity.exported",
      description: `Exported ${filteredActivities.length} activities as ${options.format.toUpperCase()}`,
      severity: "medium",
      metadata: {
        export_format: options.format,
        export_count: filteredActivities.length,
        include_metadata: options.include_metadata,
      },
    });

    // Generate export data based on format
    switch (options.format) {
      case "csv":
        return this.generateCSV(filteredActivities, options.include_metadata);
      case "json":
        return this.generateJSON(filteredActivities, options.include_metadata);
      case "xlsx":
        return this.generateExcel(filteredActivities, options.include_metadata);
      default:
        throw new Error("Unsupported export format");
    }
  }

  /**
   * Subscribe to activity changes
   */
  subscribe(callback: (activities: Activity[]) => void): () => void {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get activity statistics
   */
  getStatistics(filter?: ActivityFilter) {
    const activities = this.getActivities(filter);

    return {
      total: activities.length,
      by_type: this.groupBy(activities, "type"),
      by_severity: this.groupBy(activities, "severity"),
      by_status: this.groupBy(activities, "status"),
      by_user: activities.reduce(
        (acc, activity) => {
          if (activity.user) {
            const userId = activity.user._id;
            acc[userId] = (acc[userId] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
      today: activities.filter((activity) => {
        const today = new Date().toDateString();
        return new Date(activity.timestamp).toDateString() === today;
      }).length,
      last_hour: activities.filter((activity) => {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return new Date(activity.timestamp) >= hourAgo;
      }).length,
    };
  }

  /**
   * Convenient logging methods for common activities
   */
  async logUserAction(
    action: string,
    user: ActivityUser,
    metadata?: Partial<ActivityMetadata>
  ) {
    return this.logActivity({
      type: "user_action",
      action,
      description: `User ${action}`,
      user,
      severity: "low",
      metadata,
    });
  }

  async logSystemEvent(
    action: string,
    description: string,
    metadata?: Partial<ActivityMetadata>
  ) {
    return this.logActivity({
      type: "system_event",
      action,
      description,
      severity: "low",
      metadata,
    });
  }

  async logSecurityAlert(
    action: string,
    description: string,
    user?: ActivityUser,
    metadata?: Partial<ActivityMetadata>
  ) {
    return this.logActivity({
      type: "security_alert",
      action,
      description,
      user,
      severity: "high",
      status: "warning",
      metadata,
    });
  }

  async logError(
    action: string,
    description: string,
    error: Error,
    user?: ActivityUser,
    metadata?: Partial<ActivityMetadata>
  ) {
    return this.logActivity({
      type: "system_event",
      action,
      description,
      user,
      severity: "high",
      status: "error",
      metadata: {
        error_message: error.message,
        stack_trace: error.stack,
        ...metadata,
      },
    });
  }

  // Private methods

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    await this.logActivities(batch);
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback([...this.activities]));
  }

  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientIP(): Promise<string> {
    // In a real implementation, this would get the actual client IP
    return `192.168.1.${Math.floor(Math.random() * 255)}`;
  }

  private getUserAgent(): string {
    if (typeof window !== "undefined") {
      return window.navigator.userAgent;
    }
    return "Unknown";
  }

  private getSessionId(): string {
    // In a real implementation, this would get the actual session ID
    return `session_${Math.random().toString(36).substr(2, 16)}`;
  }

  private async sendToExternalService(activity: Activity): Promise<void> {
    // In production, send to external logging service
    // For now, just console.log for development
    if (process.env.NODE_ENV === "development") {
      console.log("Activity logged:", activity);
    }

    // Example: Send to logging service
    // await fetch('/api/activities', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(activity)
    // });
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce(
      (acc, item) => {
        const value = String(item[key]);
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private generateCSV(
    activities: Activity[],
    includeMetadata: boolean = false
  ): string {
    const headers = [
      "ID",
      "Type",
      "Action",
      "Description",
      "User",
      "User Role",
      "Severity",
      "Status",
      "Timestamp",
    ];

    if (includeMetadata) {
      headers.push("IP Address", "Entity Type", "Entity ID", "Duration (ms)");
    }

    const rows = activities.map((activity) => {
      const row = [
        activity._id,
        activity.type,
        activity.action,
        activity.description,
        activity.user?.name || "System",
        activity.user?.role || "system",
        activity.severity,
        activity.status,
        activity.timestamp,
      ];

      if (includeMetadata) {
        row.push(
          activity.metadata.ip_address || "",
          activity.metadata.entity_type || "",
          activity.metadata.entity_id || "",
          activity.metadata.duration_ms?.toString() || ""
        );
      }

      return row;
    });

    return [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  }

  private generateJSON(
    activities: Activity[],
    includeMetadata: boolean = false
  ): string {
    if (includeMetadata) {
      return JSON.stringify(activities, null, 2);
    }

    const simplified = activities.map((activity) => ({
      id: activity._id,
      type: activity.type,
      action: activity.action,
      description: activity.description,
      user: activity.user?.name || "System",
      user_role: activity.user?.role || "system",
      severity: activity.severity,
      status: activity.status,
      timestamp: activity.timestamp,
    }));

    return JSON.stringify(simplified, null, 2);
  }

  private generateExcel(
    activities: Activity[],
    includeMetadata: boolean = false
  ): string {
    // In a real implementation, this would generate actual Excel file
    // For now, return CSV format as placeholder
    return this.generateCSV(activities, includeMetadata);
  }

  private loadInitialData(): void {
    // Load some initial sample activities for demonstration
    const sampleActivities = this.generateSampleActivities();
    this.activities = sampleActivities;
  }

  private generateSampleActivities(): Activity[] {
    const mockUsers = [
      {
        _id: "1",
        name: "John Admin",
        email: "john@barbies.com",
        role: "admin" as const,
      },
      {
        _id: "2",
        name: "Sarah Manager",
        email: "sarah@barbies.com",
        role: "manager" as const,
      },
      {
        _id: "3",
        name: "Mike Staff",
        email: "mike@barbies.com",
        role: "user" as const,
      },
    ];

    const activities: Activity[] = [];
    const now = new Date();

    // Generate activities for the last 7 days
    for (let i = 0; i < 100; i++) {
      const randomDate = new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
      );
      const user =
        Math.random() > 0.1
          ? mockUsers[Math.floor(Math.random() * mockUsers.length)]
          : null;
      const configs = Object.values(ACTIVITY_CONFIGS);
      const config = configs[Math.floor(Math.random() * configs.length)];

      activities.push({
        _id: this.generateId(),
        type: config.type,
        action: config.action,
        description: config.description,
        user,
        severity: config.severity,
        status: ["success", "warning", "error", "info"][
          Math.floor(Math.random() * 4)
        ] as ActivityStatus,
        metadata: {
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          session_id: `session_${Math.random().toString(36).substr(2, 16)}`,
          request_id: this.generateRequestId(),
          entity_id: `entity_${Math.floor(Math.random() * 1000)}`,
          entity_type: ["product", "order", "booking", "user"][
            Math.floor(Math.random() * 4)
          ],
          duration_ms: Math.floor(Math.random() * 5000),
        },
        timestamp: randomDate.toISOString(),
        created_at: randomDate.toISOString(),
        updated_at: randomDate.toISOString(),
      });
    }

    return activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

// Singleton instance
export const activityLogger = new ActivityLoggerService();

// Convenience functions for common logging patterns
export const logUserCreated = (
  user: ActivityUser,
  createdBy: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) =>
  activityLogger.logActivity({
    ...ACTIVITY_CONFIGS.USER_CREATED,
    user: createdBy,
    target_user: user,
    metadata,
  });

export const logUserUpdated = (
  user: ActivityUser,
  updatedBy: ActivityUser,
  changes: string[],
  metadata?: Partial<ActivityMetadata>
) =>
  activityLogger.logActivity({
    ...ACTIVITY_CONFIGS.USER_UPDATED,
    user: updatedBy,
    target_user: user,
    metadata: {
      changes,
      ...metadata,
    },
  });

export const logUserDeleted = (
  user: ActivityUser,
  deletedBy: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) =>
  activityLogger.logActivity({
    ...ACTIVITY_CONFIGS.USER_DELETED,
    user: deletedBy,
    target_user: user,
    metadata,
  });

export const logProductCreated = (
  productId: string,
  user: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) =>
  activityLogger.logActivity({
    ...ACTIVITY_CONFIGS.PRODUCT_CREATED,
    user,
    metadata: {
      entity_type: "product",
      entity_id: productId,
      ...metadata,
    },
  });

export const logOrderUpdated = (
  orderId: string,
  newStatus: string,
  user: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) =>
  activityLogger.logActivity({
    ...ACTIVITY_CONFIGS.ORDER_UPDATED,
    description: `Order status updated to ${newStatus}`,
    user,
    metadata: {
      entity_type: "order",
      entity_id: orderId,
      new_values: { status: newStatus },
      ...metadata,
    },
  });

export const logBookingCreated = (
  bookingId: string,
  user: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) =>
  activityLogger.logActivity({
    ...ACTIVITY_CONFIGS.BOOKING_CREATED,
    user,
    metadata: {
      entity_type: "booking",
      entity_id: bookingId,
      ...metadata,
    },
  });

export const logSecurityAlert = (
  action: string,
  description: string,
  user?: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) => activityLogger.logSecurityAlert(action, description, user, metadata);

export const logSystemError = (
  action: string,
  description: string,
  error: Error,
  user?: ActivityUser,
  metadata?: Partial<ActivityMetadata>
) => activityLogger.logError(action, description, error, user, metadata);

export default ActivityLoggerService;
