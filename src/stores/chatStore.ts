import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the message interface
export interface Message {
  role: string;
  content: string;
}

// Define the state interface
interface ChatState {
  // State
  messages: Message[];

  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

// Create the store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],

      // Actions
      addMessage: (message: Message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setMessages: (messages: Message[]) =>
        set(() => ({
          messages,
        })),

      clearMessages: () =>
        set(() => ({
          messages: [],
        })),
    }),
    {
      name: 'chat-storage', // unique name for localStorage key
    }
  )
);
