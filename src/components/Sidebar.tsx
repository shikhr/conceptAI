'use client';

import React, { useState, useEffect } from 'react';
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
  onCreateDraftChat: () => void;
  draftChatId: string | null;
}

export default function Sidebar({
  isCollapsed,
  toggleSidebar,
  onCreateDraftChat,
  draftChatId,
}: SidebarProps) {
  const {
    chats,
    activeChat,
    addChat,
    deleteChat,
    setActiveChat,
    updateChatTitle,
  } = useChatStore();
  const { setActiveChat: setActiveGraphChat } = useGraphStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Handle creating a new chat
  const handleNewChat = () => {
    // Instead of directly creating a real chat, create a draft chat
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
        <div className="p-2 flex justify-end">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-opacity-80 transition-colors"
            style={{
              backgroundColor: 'var(--muted-background)',
              color: 'var(--card-foreground)',
            }}
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={handleNewChat}
          className="mx-auto my-2 p-2 rounded-full transition-colors"
          style={{
            backgroundColor: 'var(--accent-foreground)',
            color: 'white',
          }}
          aria-label="New chat"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Show draft chat if it exists */}
          {draftChatId && (
            <div
              key={draftChatId}
              onClick={() => handleSelectChat(draftChatId)}
              className={`p-2 mx-2 mb-1 rounded-md cursor-pointer transition-colors flex justify-center ${
                activeChat === draftChatId
                  ? 'bg-opacity-20'
                  : 'hover:bg-opacity-10'
              }`}
              style={{
                backgroundColor:
                  activeChat === draftChatId
                    ? 'var(--accent-foreground)'
                    : 'transparent',
                color: 'var(--card-foreground)',
              }}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
          )}

          {/* Show persisted chats */}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`p-2 mx-2 mb-1 rounded-md cursor-pointer transition-colors flex justify-center ${
                activeChat === chat.id ? 'bg-opacity-20' : 'hover:bg-opacity-10'
              }`}
              style={{
                backgroundColor:
                  activeChat === chat.id
                    ? 'var(--accent-foreground)'
                    : 'transparent',
                color: 'var(--card-foreground)',
              }}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
          ))}
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
        className="p-3 flex justify-between items-center border-b"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <h2
          className="font-semibold"
          style={{ color: 'var(--card-foreground)' }}
        >
          Chats
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-opacity-80 transition-colors"
          style={{
            backgroundColor: 'var(--muted-background)',
            color: 'var(--card-foreground)',
          }}
          aria-label="Collapse sidebar"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full p-2 rounded-md transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--accent-foreground)',
            color: 'white',
          }}
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {chats.length === 0 && !draftChatId ? (
          <div
            className="text-center py-4 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            No chats yet. Create a new chat to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {/* Show draft chat if it exists */}
            {draftChatId && (
              <div
                key={draftChatId}
                onClick={() => handleSelectChat(draftChatId)}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  activeChat === draftChatId
                    ? 'bg-opacity-20'
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor:
                    activeChat === draftChatId
                      ? 'var(--accent-foreground)'
                      : 'transparent',
                  color: 'var(--card-foreground)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 truncate">
                    New Chat{' '}
                    <span className="text-xs ml-2 opacity-50">(Draft)</span>
                  </div>
                </div>
                <div
                  className="text-xs mt-1 truncate"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Just now
                </div>
              </div>
            )}

            {/* Show persisted chats */}
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  activeChat === chat.id
                    ? 'bg-opacity-20'
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor:
                    activeChat === chat.id
                      ? 'var(--accent-foreground)'
                      : 'transparent',
                  color: 'var(--card-foreground)',
                }}
              >
                <div className="flex justify-between items-start">
                  {editingChatId === chat.id ? (
                    <div
                      className="flex items-center gap-1 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 p-1 text-sm rounded"
                        style={{
                          backgroundColor: 'var(--background)',
                          color: 'var(--foreground)',
                          border: '1px solid var(--card-border)',
                        }}
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveEdit(chat.id, e)}
                        className="p-1 rounded"
                        style={{
                          backgroundColor: 'var(--muted-background)',
                          color: 'var(--card-foreground)',
                        }}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 rounded"
                        style={{
                          backgroundColor: 'var(--muted-background)',
                          color: 'var(--card-foreground)',
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 truncate">{chat.title}</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleStartEdit(chat, e)}
                          className="p-1 rounded-md opacity-50 hover:opacity-100"
                          aria-label="Edit chat title"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="p-1 rounded-md opacity-50 hover:opacity-100 hover:text-red-500"
                          aria-label="Delete chat"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
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
