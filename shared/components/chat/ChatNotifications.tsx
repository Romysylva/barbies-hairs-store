"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Bell,
  BellOff,
  MessageSquare,
  X,
  Check,
  Volume2,
  VolumeX,
  Settings,
  Users,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Notification {
  id: string;
  type: "message" | "mention" | "group" | "system" | "booking" | "urgent";
  title: string;
  message: string;
  sender?: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  isRead: boolean;
  chatId?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "message",
    title: "New message from Emily",
    message: "Sure, I'll handle the 3 PM appointment",
    sender: {
      name: "Emily Rodriguez",
      avatar: "/api/placeholder/40/40",
    },
    timestamp: "2024-01-15T16:45:00Z",
    isRead: false,
    chatId: "chat-1",
    priority: "medium",
  },
  {
    id: "notif-2",
    type: "mention",
    title: "You were mentioned in Staff Team",
    message: "@admin can you check the inventory levels?",
    sender: {
      name: "Jessica Chen",
      avatar: "/api/placeholder/40/40",
    },
    timestamp: "2024-01-15T16:30:00Z",
    isRead: false,
    chatId: "chat-2",
    priority: "high",
  },
  {
    id: "notif-3",
    type: "urgent",
    title: "Urgent: Booking Conflict",
    message: "Double booking detected for 3 PM slot",
    timestamp: "2024-01-15T16:15:00Z",
    isRead: true,
    priority: "urgent",
  },
  {
    id: "notif-4",
    type: "system",
    title: "System Update",
    message: "Chat system has been updated with new features",
    timestamp: "2024-01-15T15:00:00Z",
    isRead: true,
    priority: "low",
  },
];

interface ChatNotificationsProps {
  isOpen: boolean;
  onToggle: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export function ChatNotifications({
  isOpen,
  onToggle,
  onNotificationClick,
}: ChatNotificationsProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notifTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === "urgent") {
      return { icon: AlertTriangle, color: "text-destructive" };
    }

    switch (type) {
      case "message":
        return { icon: MessageSquare, color: "text-primary" };
      case "mention":
        return { icon: MessageSquare, color: "text-warning-500" };
      case "group":
        return { icon: Users, color: "text-blue-500" };
      case "booking":
        return { icon: Calendar, color: "text-purple-500" };
      case "system":
        return { icon: Info, color: "text-muted-foreground" };
      default:
        return { icon: Bell, color: "text-muted-foreground" };
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate typing indicator
      // In a real app, this would come from WebSocket events
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40 w-80 bg-background border border-border rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" size="sm">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {unreadCount > 0 && (
        <div className="p-3 border-b border-border bg-muted/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const { icon: IconComponent, color } = getNotificationIcon(
                notification.type,
                notification.priority
              );

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    onNotificationClick?.(notification);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`text-sm font-medium truncate ${!notification.isRead ? "font-semibold" : ""}`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.sender && (
                          <div className="flex items-center gap-1">
                            <img
                              src={notification.sender.avatar}
                              alt={notification.sender.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="text-xs text-muted-foreground">
                              {notification.sender.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>
    </div>
  );
}
