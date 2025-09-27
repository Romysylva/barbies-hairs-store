// useActivityLogger Hook - Easy integration for activity tracking

import { useCallback } from 'react';
import {
  activityLogger,
  logUserCreated,
  logUserUpdated,
  logUserDeleted,
  logProductCreated,
  logOrderUpdated,
  logBookingCreated,
  logSecurityAlert,
  logSystemError
} from '../services/ActivityLoggerService';
import {
  ActivityUser,
  ActivityMetadata,
  LogActivityParams
} from '../services/ActivityLoggerService';

interface UseActivityLoggerReturn {
  // Core logging functions
  logActivity: (params: LogActivityParams) => Promise<void>;
  logUserAction: (action: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logSystemEvent: (action: string, description: string, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  
  // Specific entity logging functions
  logUserCreated: (user: ActivityUser, createdBy: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logUserUpdated: (user: ActivityUser, updatedBy: ActivityUser, changes: string[], metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logUserDeleted: (user: ActivityUser, deletedBy: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logUserSuspended: (user: ActivityUser, suspendedBy: ActivityUser, reason?: string, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logUserActivated: (user: ActivityUser, activatedBy: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  
  logProductCreated: (productId: string, productName: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logProductUpdated: (productId: string, productName: string, user: ActivityUser, changes: string[], metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logProductDeleted: (productId: string, productName: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logInventoryUpdated: (productId: string, oldQuantity: number, newQuantity: number, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  
  logOrderCreated: (orderId: string, customerId: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logOrderUpdated: (orderId: string, oldStatus: string, newStatus: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logOrderCancelled: (orderId: string, reason: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logRefundProcessed: (orderId: string, amount: number, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  
  logBookingCreated: (bookingId: string, customerId: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logBookingUpdated: (bookingId: string, user: ActivityUser, changes: string[], metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logBookingCancelled: (bookingId: string, reason: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logStaffAssigned: (bookingId: string, staffId: string, staffName: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  
  // Security and error logging
  logSecurityAlert: (action: string, description: string, user?: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logSystemError: (action: string, description: string, error: Error, user?: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logUnauthorizedAccess: (attemptedAction: string, user?: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  logDataExport: (dataType: string, recordCount: number, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
  
  // Bulk operations logging
  logBulkOperation: (operation: string, entityType: string, entityIds: string[], user: ActivityUser, metadata?: Partial<ActivityMetadata>) => Promise<void>;
}

export const useActivityLogger = (currentUser?: ActivityUser): UseActivityLoggerReturn => {
  // Core logging functions
  const logActivity = useCallback(async (params: LogActivityParams) => {
    try {
      await activityLogger.logActivity(params);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, []);

  const logUserAction = useCallback(async (action: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'user_action',
      action,
      description: `User performed: ${action}`,
      user,
      severity: 'low',
      metadata
    });
  }, [logActivity]);

  const logSystemEvent = useCallback(async (action: string, description: string, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'system_event',
      action,
      description,
      severity: 'low',
      metadata
    });
  }, [logActivity]);

  // User management logging
  const logUserCreatedAction = useCallback(async (user: ActivityUser, createdBy: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logUserCreated(user, createdBy, metadata);
  }, []);

  const logUserUpdatedAction = useCallback(async (user: ActivityUser, updatedBy: ActivityUser, changes: string[], metadata?: Partial<ActivityMetadata>) => {
    await logUserUpdated(user, updatedBy, changes, metadata);
  }, []);

  const logUserDeletedAction = useCallback(async (user: ActivityUser, deletedBy: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logUserDeleted(user, deletedBy, metadata);
  }, []);

  const logUserSuspended = useCallback(async (user: ActivityUser, suspendedBy: ActivityUser, reason?: string, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'security_alert',
      action: 'user.suspended',
      description: `User account suspended: ${user.name}`,
      user: suspendedBy,
      target_user: user,
      severity: 'high',
      status: 'warning',
      metadata: {
        reason,
        ...metadata
      }
    });
  }, [logActivity]);

  const logUserActivated = useCallback(async (user: ActivityUser, activatedBy: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'user_action',
      action: 'user.activated',
      description: `User account activated: ${user.name}`,
      user: activatedBy,
      target_user: user,
      severity: 'medium',
      metadata
    });
  }, [logActivity]);

  // Product management logging
  const logProductCreatedAction = useCallback(async (productId: string, productName: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'product_change',
      action: 'product.created',
      description: `Created new product: ${productName}`,
      user,
      severity: 'medium',
      metadata: {
        entity_type: 'product',
        entity_id: productId,
        product_name: productName,
        ...metadata
      }
    });
  }, [logActivity]);

  const logProductUpdatedAction = useCallback(async (productId: string, productName: string, user: ActivityUser, changes: string[], metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'product_change',
      action: 'product.updated',
      description: `Updated product: ${productName}`,
      user,
      severity: 'low',
      metadata: {
        entity_type: 'product',
        entity_id: productId,
        product_name: productName,
        changes,
        ...metadata
      }
    });
  }, [logActivity]);

  const logProductDeletedAction = useCallback(async (productId: string, productName: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'product_change',
      action: 'product.deleted',
      description: `Deleted product: ${productName}`,
      user,
      severity: 'medium',
      metadata: {
        entity_type: 'product',
        entity_id: productId,
        product_name: productName,
        ...metadata
      }
    });
  }, [logActivity]);

  const logInventoryUpdatedAction = useCallback(async (productId: string, oldQuantity: number, newQuantity: number, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'product_change',
      action: 'inventory.updated',
      description: `Inventory updated: ${oldQuantity} → ${newQuantity}`,
      user,
      severity: 'low',
      metadata: {
        entity_type: 'product',
        entity_id: productId,
        old_values: { quantity: oldQuantity },
        new_values: { quantity: newQuantity },
        changes: [`Quantity changed from ${oldQuantity} to ${newQuantity}`],
        ...metadata
      }
    });
  }, [logActivity]);

  // Order management logging
  const logOrderCreatedAction = useCallback(async (orderId: string, customerId: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'order_update',
      action: 'order.created',
      description: `New order created: #${orderId}`,
      user,
      severity: 'low',
      metadata: {
        entity_type: 'order',
        entity_id: orderId,
        customer_id: customerId,
        ...metadata
      }
    });
  }, [logActivity]);

  const logOrderUpdatedAction = useCallback(async (orderId: string, oldStatus: string, newStatus: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logOrderUpdated(orderId, newStatus, user, {
      old_values: { status: oldStatus },
      changes: [`Status changed from ${oldStatus} to ${newStatus}`],
      ...metadata
    });
  }, []);

  const logOrderCancelledAction = useCallback(async (orderId: string, reason: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'order_update',
      action: 'order.cancelled',
      description: `Order cancelled: #${orderId}`,
      user,
      severity: 'medium',
      metadata: {
        entity_type: 'order',
        entity_id: orderId,
        reason,
        ...metadata
      }
    });
  }, [logActivity]);

  const logRefundProcessedAction = useCallback(async (orderId: string, amount: number, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'payment_event',
      action: 'payment.refund',
      description: `Refund processed: $${amount.toFixed(2)} for order #${orderId}`,
      user,
      severity: 'medium',
      metadata: {
        entity_type: 'order',
        entity_id: orderId,
        refund_amount: amount,
        ...metadata
      }
    });
  }, [logActivity]);

  // Booking management logging
  const logBookingCreatedAction = useCallback(async (bookingId: string, customerId: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logBookingCreated(bookingId, user, {
      customer_id: customerId,
      ...metadata
    });
  }, []);

  const logBookingUpdatedAction = useCallback(async (bookingId: string, user: ActivityUser, changes: string[], metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'booking_change',
      action: 'booking.updated',
      description: `Booking updated: #${bookingId}`,
      user,
      severity: 'low',
      metadata: {
        entity_type: 'booking',
        entity_id: bookingId,
        changes,
        ...metadata
      }
    });
  }, [logActivity]);

  const logBookingCancelledAction = useCallback(async (bookingId: string, reason: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'booking_change',
      action: 'booking.cancelled',
      description: `Booking cancelled: #${bookingId}`,
      user,
      severity: 'medium',
      metadata: {
        entity_type: 'booking',
        entity_id: bookingId,
        reason,
        ...metadata
      }
    });
  }, [logActivity]);

  const logStaffAssignedAction = useCallback(async (bookingId: string, staffId: string, staffName: string, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'booking_change',
      action: 'booking.staff_assigned',
      description: `Staff assigned to booking #${bookingId}: ${staffName}`,
      user,
      severity: 'low',
      metadata: {
        entity_type: 'booking',
        entity_id: bookingId,
        staff_id: staffId,
        staff_name: staffName,
        ...metadata
      }
    });
  }, [logActivity]);

  // Security and error logging
  const logSecurityAlertAction = useCallback(async (action: string, description: string, user?: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logSecurityAlert(action, description, user, metadata);
  }, []);

  const logSystemErrorAction = useCallback(async (action: string, description: string, error: Error, user?: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logSystemError(action, description, error, user, metadata);
  }, []);

  const logUnauthorizedAccess = useCallback(async (attemptedAction: string, user?: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'security_alert',
      action: 'security.unauthorized_access',
      description: `Unauthorized access attempt: ${attemptedAction}`,
      user,
      severity: 'critical',
      status: 'error',
      metadata: {
        attempted_action: attemptedAction,
        ...metadata
      }
    });
  }, [logActivity]);

  const logDataExportAction = useCallback(async (dataType: string, recordCount: number, user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'data_export',
      action: 'data.exported',
      description: `Exported ${recordCount} ${dataType} records`,
      user,
      severity: 'medium',
      metadata: {
        data_type: dataType,
        record_count: recordCount,
        ...metadata
      }
    });
  }, [logActivity]);

  // Bulk operations logging
  const logBulkOperation = useCallback(async (operation: string, entityType: string, entityIds: string[], user: ActivityUser, metadata?: Partial<ActivityMetadata>) => {
    await logActivity({
      type: 'user_action',
      action: `bulk.${operation}`,
      description: `Bulk ${operation} performed on ${entityIds.length} ${entityType}(s)`,
      user,
      severity: 'medium',
      metadata: {
        operation,
        entity_type: entityType,
        entity_ids: entityIds,
        affected_count: entityIds.length,
        ...metadata
      }
    });
  }, [logActivity]);

  return {
    logActivity,
    logUserAction,
    logSystemEvent,
    logUserCreated: logUserCreatedAction,
    logUserUpdated: logUserUpdatedAction,
    logUserDeleted: logUserDeletedAction,
    logUserSuspended,
    logUserActivated,
    logProductCreated: logProductCreatedAction,
    logProductUpdated: logProductUpdatedAction,
    logProductDeleted: logProductDeletedAction,
    logInventoryUpdated: logInventoryUpdatedAction,
    logOrderCreated: logOrderCreatedAction,
    logOrderUpdated: logOrderUpdatedAction,
    logOrderCancelled: logOrderCancelledAction,
    logRefundProcessed: logRefundProcessedAction,
    logBookingCreated: logBookingCreatedAction,
    logBookingUpdated: logBookingUpdatedAction,
    logBookingCancelled: logBookingCancelledAction,
    logStaffAssigned: logStaffAssignedAction,
    logSecurityAlert: logSecurityAlertAction,
    logSystemError: logSystemErrorAction,
    logUnauthorizedAccess,
    logDataExport: logDataExportAction,
    logBulkOperation
  };
};

export default useActivityLogger;

// Additional utility hooks

/**
 * Hook for tracking page visits and user navigation
 */
export const usePageTracking = (pageName: string, user?: ActivityUser) => {
  const { logUserAction } = useActivityLogger(user);

  const trackPageVisit = useCallback(async () => {
    if (user) {
      await logUserAction('page.visited', user, {
        page_name: pageName,
        visit_time: new Date().toISOString()
      });
    }
  }, [logUserAction, pageName, user]);

  const trackPageExit = useCallback(async (timeSpent: number) => {
    if (user) {
      await logUserAction('page.exited', user, {
        page_name: pageName,
        time_spent_ms: timeSpent,
        exit_time: new Date().toISOString()
      });
    }
  }, [logUserAction, pageName, user]);

  return { trackPageVisit, trackPageExit };
};

/**
 * Hook for tracking form interactions
 */
export const useFormTracking = (formName: string, user?: ActivityUser) => {
  const { logUserAction } = useActivityLogger(user);

  const trackFormStart = useCallback(async () => {
    if (user) {
      await logUserAction('form.started', user, {
        form_name: formName,
        start_time: new Date().toISOString()
      });
    }
  }, [logUserAction, formName, user]);

  const trackFormSubmit = useCallback(async (successful: boolean, errors?: string[]) => {
    if (user) {
      await logUserAction(successful ? 'form.submitted' : 'form.submit_failed', user, {
        form_name: formName,
        successful,
        errors,
        submit_time: new Date().toISOString()
      });
    }
  }, [logUserAction, formName, user]);

  const trackFormAbandoned = useCallback(async (timeSpent: number, completionPercentage: number) => {
    if (user) {
      await logUserAction('form.abandoned', user, {
        form_name: formName,
        time_spent_ms: timeSpent,
        completion_percentage: completionPercentage,
        abandon_time: new Date().toISOString()
      });
    }
  }, [logUserAction, formName, user]);

  return { trackFormStart, trackFormSubmit, trackFormAbandoned };
};

/**
 * Hook for tracking search and filter usage
 */
export const useSearchTracking = (searchContext: string, user?: ActivityUser) => {
  const { logUserAction } = useActivityLogger(user);

  const trackSearch = useCallback(async (query: string, resultCount: number) => {
    if (user) {
      await logUserAction('search.performed', user, {
        search_context: searchContext,
        search_query: query,
        result_count: resultCount,
        search_time: new Date().toISOString()
      });
    }
  }, [logUserAction, searchContext, user]);

  const trackFilterApplied = useCallback(async (filterType: string, filterValue: string) => {
    if (user) {
      await logUserAction('filter.applied', user, {
        search_context: searchContext,
        filter_type: filterType,
        filter_value: filterValue,
        filter_time: new Date().toISOString()
      });
    }
  }, [logUserAction, searchContext, user]);

  return { trackSearch, trackFilterApplied };
};
