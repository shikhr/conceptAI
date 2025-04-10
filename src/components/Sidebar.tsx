'use client';

import React, { useState, useEffect } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaComment,
  FaPlus,
  FaRegTrashCan,
  FaCheck,
  FaEllipsisVertical,
} from 'react-icons/fa6';

import { SlPencil } from 'react-icons/sl';
import { useChatStore, Chat } from '../stores/chatStore';
import { useGraphStore } from '../stores/graphStore';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onCreateDraftChat: () => void;
  onSelectChat?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({
  isCollapsed,
  toggleSidebar,
  onCreateDraftChat,
  onSelectChat,
}: SidebarProps) {
  const { chats, activeChat, deleteChat, setActiveChat, updateChatTitle } =
    useChatStore();
  const { setActiveChat: setActiveGraphChat } = useGraphStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Handle creating a new chat
  const handleNewChat = () => {
    onCreateDraftChat();
  };

  // Handle deleting a chat
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
    setOpenMenuId(null);
  };

  // Handle switching to a chat
  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setActiveGraphChat(chatId);
    if (onSelectChat) {
      onSelectChat();
    }
  };

  // Start editing a chat title
  const handleStartEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setOpenMenuId(null);
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

  // Toggle dropdown menu
  const handleToggleMenu = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId) {
        // Only run this when a menu is open
        if (
          !(e.target as Element).closest('.chat-options-menu') &&
          !(e.target as Element).closest('.chat-options-button')
        ) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <div
        className="h-full hidden md:flex flex-col border-r transition-all duration-300 w-16 shrink-0"
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
            <FaChevronRight
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
            <FaPlus className="h-5 w-5" />
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
                <FaComment className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Expanded sidebar view
  return (
    <div
      className="h-full flex flex-col border-r transition-all duration-300 w-64 shrink-0"
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
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hidden md:block"
          aria-label="Collapse sidebar"
        >
          <FaChevronLeft
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
          <FaPlus className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {chats.length === 0 ? (
          <div
            className="text-center py-4 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="block">No chats yet.</span>
            <span className="block">Ask something to start a chat.</span>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-2 rounded-md cursor-pointer transition-colors relative ${
                  activeChat === chat.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={{ color: 'var(--card-foreground)' }}
              >
                {/* Chat title and options */}
                <div className="flex justify-between items-center">
                  {editingChatId === chat.id ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 p-1 px-2 rounded text-sm focus:outline-none"
                        style={{
                          backgroundColor: 'var(--card-background)',
                          color: 'var(--card-foreground)',
                          border: '1px solid var(--card-border)',
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(
                              chat.id,
                              e as unknown as React.MouseEvent
                            );
                          } else if (e.key === 'Escape') {
                            handleCancelEdit(e as unknown as React.MouseEvent);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => handleSaveEdit(chat.id, e)}
                        className="p-1 rounded-md"
                        aria-label="Save chat title"
                      >
                        <FaCheck className="h-4 w-4 text-green-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate flex-1">{chat.title}</span>
                      {activeChat === chat.id && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => handleToggleMenu(chat.id, e)}
                            className="p-1 rounded-md opacity-50 hover:opacity-100 chat-options-button"
                            aria-label="Chat options"
                          >
                            <FaEllipsisVertical className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Date display */}
                <div
                  className="text-xs mt-1 truncate"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {formatDate(new Date(chat.updatedAt))}
                </div>

                {/* Dropdown menu - rendered outside of the flex layout */}
                {openMenuId === chat.id && (
                  <div
                    className="absolute right-0 mt-2 w-36 py-2 rounded-md shadow-lg z-50 border chat-options-menu"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                      top: '100%',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(chat, e)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50 transition-colors flex items-center gap-2"
                      style={{ color: 'var(--card-foreground)' }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          'var(--muted-background)')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <SlPencil className="h-4 w-4" />
                      <span>Edit title</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50 transition-colors flex items-center gap-2 text-red-500"
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          'var(--muted-background)')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <FaRegTrashCan className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
