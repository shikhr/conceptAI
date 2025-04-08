import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create app version constant to use across all stores
export const APP_VERSION = 6; // Increment this when making breaking changes to data structures

// Define the message interface
export interface Message {
  role: string;
  content: string;
}

// Define the chat interface
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the state interface
interface ChatState {
  // State
  version: number; // Added version tracking
  chats: Chat[];
  activeChat: string | null;

  // Actions
  addChat: (title?: string) => string;
  deleteChat: (chatId: string) => void;
  setActiveChat: (chatId: string) => void;
  addMessage: (message: Message, chatId?: string) => void;
  setMessages: (messages: Message[], chatId?: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  clearMessages: (chatId?: string) => void;
  getActiveChat: () => Chat | null;
  getActiveChatMessages: () => Message[];
}

// Create the store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      version: APP_VERSION, // Use the shared version constant
      chats: [],
      activeChat: null,

      // Actions
      addChat: (title = 'New Chat') => {
        const id = crypto.randomUUID();
        const newChat: Chat = {
          id,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: id,
        }));

        return id;
      },

      deleteChat: (chatId: string) => {
        const { chats, activeChat } = get();
        const updatedChats = chats.filter((chat) => chat.id !== chatId);

        // If deleting the active chat, set the first chat as active or null if no chats
        const newActiveChat =
          activeChat === chatId
            ? updatedChats.length > 0
              ? updatedChats[0].id
              : null
            : activeChat;

        set({
          chats: updatedChats,
          activeChat: newActiveChat,
        });
      },

      setActiveChat: (chatId: string) => {
        set({ activeChat: chatId });
      },

      getActiveChat: () => {
        const { chats, activeChat } = get();
        if (!activeChat) return null;
        return chats.find((chat) => chat.id === activeChat) || null;
      },

      getActiveChatMessages: () => {
        const activeChat = get().getActiveChat();
        return activeChat ? activeChat.messages : [];
      },

      addMessage: (message: Message, chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === targetChatId) {
              return {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
      },

      setMessages: (messages: Message[], chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === targetChatId) {
              return {
                ...chat,
                messages,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                title,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
      },

      clearMessages: (chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === targetChatId) {
              return {
                ...chat,
                messages: [],
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
      },
    }),
    {
      name: 'chat-storage', // unique name for localStorage key
      version: APP_VERSION, // Use the shared version constant
      migrate: (persistedState: any, version) => {
        // If migrating from an older version or version doesn't match current
        if (version !== APP_VERSION) {
          // Clear localStorage and start fresh
          localStorage.removeItem('chat-storage');
          return {
            version: APP_VERSION,
            chats: [],
            activeChat: null,
          };
        }
        return persistedState as ChatState;
      },
    }
  )
);
