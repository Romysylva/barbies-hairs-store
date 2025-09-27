/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
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
  File,
  Clock,
  Check,
  CheckCheck,
  Pin,
  Archive,
  Trash2,
  Plus,
  Hash,
  Bell,
  BellOff,
  UserPlus,
  Edit,
  Star,
  Mic,
  MicOff,
  ScreenShare,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Zap,
  Heart,
  ThumbsUp,
  Laugh,
} from "lucide-react";

// Mock data (same as AdminChatSystem but expanded)
const mockUsers = [
  {
    id: "user-1",
    name: "Emily Rodriguez",
    role: "Senior Stylist",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastSeen: null,
    department: "Hair Services",
  },
  {
    id: "user-2",
    name: "Jessica Chen",
    role: "Color Specialist",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastSeen: null,
    department: "Color Services",
  },
  {
    id: "user-3",
    name: "Maria Santos",
    role: "Treatment Specialist",
    avatar: "/api/placeholder/40/40",
    status: "away",
    lastSeen: "2024-01-15T15:30:00Z",
    department: "Treatment Services",
  },
  {
    id: "user-4",
    name: "Alex Thompson",
    role: "Men's Specialist",
    avatar: "/api/placeholder/40/40",
    status: "offline",
    lastSeen: "2024-01-15T12:00:00Z",
    department: "Hair Services",
  },
  {
    id: "user-5",
    name: "Admin User",
    role: "System Administrator",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastSeen: null,
    department: "Management",
  },
];

const mockChats = [
  {
    id: "chat-1",
    type: "direct" as const,
    name: "Emily Rodriguez",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Sure, I'll handle the 3 PM appointment",
    lastMessageTime: "2024-01-15T16:45:00Z",
    unreadCount: 2,
    status: "online",
    participants: ["user-1", "admin"],
    isPinned: false,
    isArchived: false,
  },
  {
    id: "chat-2",
    type: "group" as const,
    name: "All Staff",
    avatar: null,
    lastMessage: "Team meeting at 5 PM today",
    lastMessageTime: "2024-01-15T16:30:00Z",
    unreadCount: 0,
    participants: ["user-1", "user-2", "user-3", "user-4", "admin"],
    isPinned: true,
    isArchived: false,
  },
  {
    id: "chat-3",
    type: "direct" as const,
    name: "Jessica Chen",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Client wants to reschedule to next week",
    lastMessageTime: "2024-01-15T15:20:00Z",
    unreadCount: 1,
    status: "online",
    participants: ["user-2", "admin"],
    isPinned: false,
    isArchived: false,
  },
  {
    id: "chat-4",
    type: "group" as const,
    name: "Management",
    avatar: null,
    lastMessage: "Q4 performance reports are ready",
    lastMessageTime: "2024-01-15T14:10:00Z",
    unreadCount: 0,
    participants: ["user-5", "admin"],
    isPinned: false,
    isArchived: false,
  },
  {
    id: "chat-5",
    type: "direct" as const,
    name: "Maria Santos",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Thanks for the help with the inventory!",
    lastMessageTime: "2024-01-15T13:45:00Z",
    unreadCount: 0,
    status: "away",
    participants: ["user-3", "admin"],
    isPinned: false,
    isArchived: false,
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
    reactions: [],
  },
  {
    id: "msg-2",
    chatId: "chat-1",
    senderId: "admin",
    senderName: "You",
    content:
      "Yes, you have 3 appointments scheduled. The 3 PM one needs special attention - it's a new color client.",
    timestamp: "2024-01-15T16:42:00Z",
    type: "text",
    status: "read",
    reactions: [{ emoji: "👍", users: ["user-1"] }],
  },
  {
    id: "msg-3",
    chatId: "chat-1",
    senderId: "user-1",
    senderName: "Emily Rodriguez",
    content:
      "Sure, I'll handle the 3 PM appointment. Should I prepare anything specific?",
    timestamp: "2024-01-15T16:45:00Z",
    type: "text",
    status: "delivered",
    reactions: [],
  },
  {
    id: "msg-4",
    chatId: "chat-1",
    senderId: "admin",
    senderName: "You",
    content:
      "Perfect! Let me know if you need any product information for the customer. I'll send you their preferences.",
    timestamp: "2024-01-15T16:46:00Z",
    type: "text",
    status: "sent",
    reactions: [],
  },
  {
    id: "msg-5",
    chatId: "chat-1",
    senderId: "admin",
    senderName: "You",
    content:
      "Customer prefers ammonia-free colors and has sensitive scalp. Use the gentle formula.",
    timestamp: "2024-01-15T16:47:00Z",
    type: "text",
    status: "sent",
    reactions: [],
  },
];

export default function AdminChatPage() {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>("chat-1");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "busy":
        return "Busy";
      default:
        return "Offline";
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

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<RefreshCw className="h-4 w-4" />}
      >
        Sync
      </Button>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Settings className="h-4 w-4" />}
      >
        Settings
      </Button>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<UserPlus className="h-4 w-4" />}
      >
        Add Member
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Team Chat"
      description="Internal communication and collaboration"
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search conversations..."
      roles={user?.role}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Chat Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Conversations"
            description={`${filteredChats.length} active chats`}
          />
          <CardContent className="p-0 flex flex-col h-full">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                leftIcon={<Search className="h-4 w-4 sm" />}
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setShowUserList(false)}
                className={`flex-1 p-3 text-sm font-medium border-r border-border transition-colors ${
                  !showUserList
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <MessageSquare className="h-4 w-4 mx-auto mb-1" />
                Chats
              </button>
              <button
                onClick={() => setShowUserList(true)}
                className={`flex-1 p-3 text-sm font-medium transition-colors ${
                  showUserList
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Users className="h-4 w-4 mx-auto mb-1" />
                Team
              </button>
            </div>

            {/* Chat List or User List */}
            <div className="flex-1 overflow-y-auto">
              {!showUserList ? (
                <div className="p-2 space-y-1">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors relative ${
                        selectedChat === chat.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {chat.type === "direct" ? (
                          <div className="relative">
                            <Image
                              src={chat.avatar}
                              alt={chat.name}
                              className="w-10 h-10 rounded-full object-cover"
                              width={40}
                              height={40}
                            />
                            {chat.status && (
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusIndicator(chat.status)} rounded-full border-2 border-background`}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <Hash className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {chat.name}
                            </p>
                            {chat.isPinned && (
                              <Pin className="h-3 w-3 text-warning-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(chat.lastMessageTime)}
                          </p>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs">
                          {chat.unreadCount}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  <div className="p-3 border-b border-border">
                    <h4 className="text-sm font-medium mb-2">
                      Online (
                      {mockUsers.filter((u) => u.status === "online").length})
                    </h4>
                  </div>
                  {mockUsers
                    .filter((u) => u.status === "online")
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer"
                        onClick={() => {
                          // Create or find direct chat with this user
                          const existingChat = mockChats.find(
                            (c) => c.type === "direct" && c.name === user.name
                          );
                          if (existingChat) {
                            setSelectedChat(existingChat.id);
                          }
                          setShowUserList(false);
                        }}
                      >
                        <div className="relative">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            width={40}
                            height={40}
                          />
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusIndicator(user.status)} rounded-full border-2 border-background`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.department}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                  {mockUsers.filter((u) => u.status !== "online").length >
                    0 && (
                    <>
                      <div className="p-3 border-b border-border mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Offline (
                          {
                            mockUsers.filter((u) => u.status !== "online")
                              .length
                          }
                          )
                        </h4>
                      </div>
                      {mockUsers
                        .filter((u) => u.status !== "online")
                        .map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer opacity-60"
                          >
                            <div className="relative">
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                                width={40}
                                height={40}
                              />
                              <div
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusIndicator(user.status)} rounded-full border-2 border-background`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.role}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.lastSeen
                                  ? formatLastSeen(user.lastSeen)
                                  : "Offline"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3">
          {selectedChatData ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedChatData.type === "direct" ? (
                      <div className="relative">
                        <Image
                          src={selectedChatData.avatar}
                          alt={selectedChatData.name}
                          className="w-12 h-12 rounded-full object-cover"
                          width={48}
                          height={48}
                        />
                        {selectedChatData.status && (
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusIndicator(selectedChatData.status)} rounded-full border-2 border-background`}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Hash className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {selectedChatData.name}
                        </h4>
                        {selectedChatData.isPinned && (
                          <Pin className="h-4 w-4 text-warning-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedChatData.type === "direct"
                          ? getStatusText(selectedChatData.status || "offline")
                          : `${selectedChatData.participants.length} members • ${mockUsers.filter((u) => u.status === "online" && selectedChatData.participants.includes(u.id)).length} online`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ScreenShare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => {
                  const isOwn = message.senderId === "admin";
                  const sender = mockUsers.find(
                    (u) => u.id === message.senderId
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isOwn && (
                        <Image
                          src={sender?.avatar ?? "avatar.png"}
                          alt={sender?.name ?? "sender"}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          width={32}
                          height={32}
                        />
                      )}
                      <div
                        className={`max-w-[70%] ${isOwn ? "text-right" : "text-left"}`}
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
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>

                        {/* Message reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {message.reactions.map((reaction, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1"
                              >
                                <span className="text-xs">
                                  {reaction.emoji}
                                </span>
                                <span className="text-xs">
                                  {reaction.users.length}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : "justify-start"}`}
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
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <Image
                      src="/api/placeholder/40/40"
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Image
                      src={user?.photos}
                      className="h-4 w-4"
                      alt="photo"
                      width={16}
                      height={16}
                    />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <File className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewMessage(e.target.value)
                      }
                      onKeyDown={handleKeyPress}
                      className="pr-20"
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mic className="h-4 w-4" />
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

                {/* Quick Actions */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Quick Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Welcome to Team Chat
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Select a conversation from the sidebar to start messaging with
                  your team members.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View Team
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
