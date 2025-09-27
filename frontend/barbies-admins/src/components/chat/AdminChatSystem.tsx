"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Users,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Circle,
  Image,
  File,
  Clock,
  Check,
  CheckCheck,
  Pin,
  Archive,
  Trash2,
  Plus,
  Hash,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
} from "lucide-react";

// Mock chat data
const mockUsers = [
  {
    id: "user-1",
    name: "Emily Rodriguez",
    role: "Staff",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastSeen: null,
  },
  {
    id: "user-2",
    name: "Jessica Chen",
    role: "Staff",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastSeen: null,
  },
  {
    id: "user-3",
    name: "Maria Santos",
    role: "Staff",
    avatar: "/api/placeholder/40/40",
    status: "away",
    lastSeen: "2024-01-15T15:30:00Z",
  },
  {
    id: "user-4",
    name: "Alex Thompson",
    role: "Staff",
    avatar: "/api/placeholder/40/40",
    status: "offline",
    lastSeen: "2024-01-15T12:00:00Z",
  },
  {
    id: "user-5",
    name: "Admin User",
    role: "Admin",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastSeen: null,
  },
];

const mockChats = [
  {
    id: "chat-1",
    type: "direct",
    name: "Emily Rodriguez",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Sure, I'll handle the 3 PM appointment",
    lastMessageTime: "2024-01-15T16:45:00Z",
    unreadCount: 2,
    status: "online",
    participants: ["user-1", "admin"],
  },
  {
    id: "chat-2",
    type: "group",
    name: "Staff Team",
    avatar: null,
    lastMessage: "Meeting at 5 PM today",
    lastMessageTime: "2024-01-15T16:30:00Z",
    unreadCount: 0,
    participants: ["user-1", "user-2", "user-3", "user-4", "admin"],
  },
  {
    id: "chat-3",
    type: "direct",
    name: "Jessica Chen",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Client wants to reschedule to next week",
    lastMessageTime: "2024-01-15T15:20:00Z",
    unreadCount: 1,
    status: "online",
    participants: ["user-2", "admin"],
  },
  {
    id: "chat-4",
    type: "group",
    name: "Urgent Issues",
    avatar: null,
    lastMessage: "Issue with booking system resolved",
    lastMessageTime: "2024-01-15T14:10:00Z",
    unreadCount: 0,
    participants: ["user-5", "admin"],
  },
];

const mockMessages = [
  {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-1",
    senderName: "Emily Rodriguez",
    content: "Hi! I wanted to confirm the schedule for tomorrow",
    timestamp: "2024-01-15T16:40:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-2",
    chatId: "chat-1",
    senderId: "admin",
    senderName: "You",
    content:
      "Yes, you have 3 appointments scheduled. The 3 PM one needs special attention.",
    timestamp: "2024-01-15T16:42:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-3",
    chatId: "chat-1",
    senderId: "user-1",
    senderName: "Emily Rodriguez",
    content: "Sure, I'll handle the 3 PM appointment",
    timestamp: "2024-01-15T16:45:00Z",
    type: "text",
    status: "delivered",
  },
  {
    id: "msg-4",
    chatId: "chat-1",
    senderId: "admin",
    senderName: "You",
    content:
      "Perfect! Let me know if you need any product information for the customer.",
    timestamp: "2024-01-15T16:46:00Z",
    type: "text",
    status: "sent",
  },
];

interface AdminChatSystemProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export function AdminChatSystem({
  isMinimized = false,
  onToggleMinimize,
  onClose,
}: AdminChatSystemProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>("chat-1");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const formatTime = (timestamp: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp));
  };

  const formatLastSeen = (timestamp: string) => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success-500";
      case "away":
        return "bg-warning-500";
      case "busy":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = selectedChat
    ? mockChats.find((c) => c.id === selectedChat)
    : null;
  const chatMessages = selectedChat
    ? mockMessages.filter((m) => m.chatId === selectedChat)
    : [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    // Here you would normally send the message to your backend
    console.log("Sending message:", newMessage, "to chat:", selectedChat);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="primary"
          size="sm"
          onClick={onToggleMinimize}
          className="rounded-full shadow-lg"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat
          <Badge variant="destructive" size="sm" className="ml-2">
            3
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Admin Chat</h3>
          <Badge variant="secondary" size="sm">
            {mockUsers.filter((u) => u.status === "online").length} online
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotifications(!notifications)}
          >
            {notifications ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-32 border-r border-border flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              leftIcon={<Search className="h-3 w-3" />}
              className="text-xs"
              size="sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setShowUserList(false)}
              className={`flex-1 p-2 text-xs font-medium border-r border-border ${
                !showUserList
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <MessageSquare className="h-3 w-3 mx-auto mb-1" />
              Chats
            </button>
            <button
              onClick={() => setShowUserList(true)}
              className={`flex-1 p-2 text-xs font-medium ${
                showUserList
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Users className="h-3 w-3 mx-auto mb-1" />
              Team
            </button>
          </div>

          {/* Chat List or User List */}
          <div className="flex-1 overflow-y-auto">
            {!showUserList ? (
              <div className="space-y-1 p-2">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full text-left p-2 rounded-md transition-colors relative ${
                      selectedChat === chat.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {chat.type === "direct" ? (
                        <div className="relative">
                          <img
                            src={chat.avatar || "/api/placeholder/40/40"}
                            alt={chat.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          {chat.status && (
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getStatusIndicator(chat.status)} rounded-full border border-background`}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                          <Hash className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {chat.name}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {mockUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getStatusIndicator(user.status)} rounded-full border border-background`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.status === "online"
                          ? "Online"
                          : user.status === "away"
                            ? "Away"
                            : user.lastSeen
                              ? formatLastSeen(user.lastSeen)
                              : "Offline"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  {selectedChatData.type === "direct" ? (
                    <div className="relative">
                      <img
                        src={
                          selectedChatData.avatar || "/api/placeholder/40/40"
                        }
                        alt={selectedChatData.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {selectedChatData.status && (
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusIndicator(selectedChatData.status)} rounded-full border border-background`}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm">
                      {selectedChatData.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedChatData.type === "direct"
                        ? selectedChatData.status === "online"
                          ? "Active now"
                          : "Last seen " +
                            formatLastSeen(selectedChatData.lastMessageTime)
                        : `${selectedChatData.participants.length} members`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((message) => {
                  const isOwn = message.senderId === "admin";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] ${isOwn ? "order-2" : "order-1"}`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.senderName}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <span>{formatTime(message.timestamp)}</span>
                          {isOwn && (
                            <div className="flex items-center">
                              {message.status === "sent" && (
                                <Check className="h-3 w-3" />
                              )}
                              {message.status === "delivered" && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                              {message.status === "read" && (
                                <CheckCheck className="h-3 w-3 text-primary" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {!isOwn && (
                        <Image
                          src={
                            mockUsers.find((u) => u.id === message.senderId)
                              ?.avatar
                          }
                          alt=""
                          className="w-6 h-6 rounded-full object-cover order-1 mr-2 mt-2"
                        />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Image
                      className="h-4 w-4"
                      width={16}
                      height={16}
                      alt="photo to dispaly"
                    />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewMessage(e.target.value)
                      }
                      onKeyDown={handleKeyPress}
                      className="sm"
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a chat</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
