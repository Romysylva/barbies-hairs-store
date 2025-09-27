"use client";
import React, { useState } from "react";
import { AdminChatSystem } from "./AdminChatSystem";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { MessageSquare } from "lucide-react";

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className = "" }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount] = useState(3); // This would come from your chat state management

  const handleToggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsMinimized(!isMinimized);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          variant="primary"
          size="lg"
          onClick={handleToggleChat}
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <MessageSquare className="h-6 w-6 mr-2" />
          Team Chat
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              size="sm" 
              className="absolute -top-2 -right-2 min-w-6 h-6 flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <AdminChatSystem
      isMinimized={isMinimized}
      onToggleMinimize={() => setIsMinimized(!isMinimized)}
      onClose={handleCloseChat}
    />
  );
}
