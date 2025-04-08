'use client';

import React, { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useChatStore, Chat } from '../stores/chatStore';
import { useGraphStore } from '../stores/graphStore';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onCreateDraftChat: () => void; // Keeping the same prop name for compatibility, but it now creates a real chat
}

export default function Sidebar({
  isCollapsed,
  toggleSidebar,
  onCreateDraftChat,
}: SidebarProps) {
  const { chats, activeChat, deleteChat, setActiveChat, updateChatTitle } =
    useChatStore();
  const { setActiveChat: setActiveGraphChat } = useGraphStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Handle creating a new chat
  const handleNewChat = () => {
    onCreateDraftChat();
  };

  // Handle deleting a chat
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  // Handle switching to a chat
  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    // Sync with graph store
    setActiveGraphChat(chatId);
  };

  // Start editing a chat title
  const handleStartEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  // Save the edited chat title
  const handleSaveEdit = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      updateChatTitle(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  // Cancel editing
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isCollapsed) {
    return (
      <div
        className="h-full flex flex-col border-r transition-all duration-300 w-16"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div
          className="flex justify-center p-3 border-b"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon
              className="h-5 w-5"
              style={{ color: 'var(--card-foreground)' }}
            />
          </button>
        </div>

        <div className="flex-1">
          <button
            onClick={handleNewChat}
            className="w-full p-2 my-2 flex justify-center"
            style={{ color: 'var(--card-foreground)' }}
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <div className="flex-1 overflow-y-auto py-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-2 mx-2 mb-1 rounded-md cursor-pointer transition-colors flex justify-center ${
                  activeChat === chat.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={{
                  color: 'var(--card-foreground)',
                }}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col border-r transition-all duration-300 w-64"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div
        className="flex justify-between items-center p-3 border-b"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div
          className="font-semibold"
          style={{ color: 'var(--card-foreground)' }}
        >
          Chats
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Collapse sidebar"
        >
          <ChevronLeftIcon
            className="h-5 w-5"
            style={{ color: 'var(--card-foreground)' }}
          />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full p-2 rounded-md flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: 'var(--card-foreground)' }}
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {chats.length === 0 ? (
          <div
            className="text-center py-4 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            No chats yet. Create a new chat to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {/* Show persisted chats */}
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  activeChat === chat.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={{
                  color: 'var(--card-foreground)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 truncate">
                    {editingChatId === chat.id ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 p-1 rounded text-sm focus:outline-none focus:ring-1"
                          style={
                            {
                              backgroundColor: 'var(--background)',
                              color: 'var(--card-foreground)',
                              borderColor: 'var(--card-border)',
                              ['--tw-ring-color' as string]:
                                'var(--accent-foreground)',
                            } as React.CSSProperties
                          }
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(
                                chat.id,
                                e as unknown as React.MouseEvent
                              );
                            } else if (e.key === 'Escape') {
                              handleCancelEdit(
                                e as unknown as React.MouseEvent
                              );
                            }
                          }}
                        />
                        <button
                          onClick={(e) => handleSaveEdit(chat.id, e)}
                          className="p-1 rounded-md"
                          aria-label="Save chat title"
                        >
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded-md"
                          aria-label="Cancel editing"
                        >
                          <XMarkIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="truncate">{chat.title}</span>
                        <div className="flex opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => handleStartEdit(chat, e)}
                            className="p-1 rounded-md opacity-50 hover:opacity-100"
                            aria-label="Edit chat title"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="p-1 rounded-md opacity-50 hover:opacity-100 hover:text-red-500"
                            aria-label="Delete chat"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="text-xs mt-1 truncate"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {formatDate(new Date(chat.updatedAt))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
