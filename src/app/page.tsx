'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from 'react-resizable-panels';
import ChatPanel from '@/components/ChatPanel';
import GraphPanel from '@/components/GraphPanel';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import { useThemeStore } from '@/stores/themeStore';
import { useChatStore } from '@/stores/chatStore';
import { useGraphStore } from '@/stores/graphStore';

export default function Dashboard() {
  const { initTheme } = useThemeStore();
  const {
    getActiveChat,
    getActiveChatMessages,
    addMessage,
    addChat,
    activeChat,
    setActiveChat,
  } = useChatStore();
  const {
    setGraphData,
    getGraphDataString,
    setActiveChat: setActiveGraphChat,
  } = useGraphStore();

  const [isPendingChat, setIsPendingChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'graph'>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize theme based on saved preference or system preference
    initTheme();

    // Check if device is mobile
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      // When transitioning to mobile view, ensure the sidebar is not collapsed
      if (isMobileView) {
        // Set sidebar to expanded state when entering mobile view
        setIsSidebarCollapsed(false);
        // But keep it hidden by default on mobile
        setIsMobileSidebarOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Create a new chat if there's no active chat and no pending chat
    if (!activeChat && !isPendingChat) {
      // Instead of creating a new chat, set pending chat state
      setIsPendingChat(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [initTheme, activeChat, isPendingChat]);

  // Independent state for each panel's collapse state
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // References to Panel components
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Function to process a message with the API
  const processMessage = async (message: string, chatId: string) => {
    try {
      // Get current messages and graph data
      const messages = getActiveChatMessages();
      const currentGraphStrings = getGraphDataString();
      const currentGraph = currentGraphStrings.join('\n');

      const userMessage = { role: 'user', content: message };
      addMessage(userMessage, chatId);

      // Call API with the current messages and user query
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          graph: currentGraph,
          query: message,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Update chat history with assistant's response
      const assistantMessage = { role: 'assistant', content: data.response };
      addMessage(assistantMessage, chatId);

      // Update graph data only if response contains graph data
      if (data.graph && data.graph.length > 0) {
        setGraphData(data.graph, chatId);
      }

      // If this was the first message, update the chat title
      const currentChat = getActiveChat();
      if (currentChat && currentChat.messages.length <= 2) {
        // Extract a title from the first message (limited to ~30 chars)
        const titleText =
          message.length > 30 ? message.substring(0, 27) + '...' : message;

        useChatStore.getState().updateChatTitle(currentChat.id, titleText);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage(
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
        chatId
      );
    }
  };

  // Function to handle new messages
  const handleSendMessage = async (message: string) => {
    // If we're in pending chat mode, create a new chat first
    if (isPendingChat) {
      const newChatId = addChat('New Chat');
      setActiveChat(newChatId);
      setActiveGraphChat(newChatId);
      setIsPendingChat(false);

      // Process the message with the new chat
      processMessage(message, newChatId);
      return;
    }

    const chatId = activeChat;
    if (!chatId) {
      // If somehow there's no active chat, create one
      const newChatId = addChat('New Chat');
      setActiveGraphChat(newChatId);
      processMessage(message, newChatId);
      return;
    }

    // Process the message with API
    processMessage(message, chatId);
  };

  // Toggle function for mobile view
  const toggleMobileView = () => {
    setActiveView(activeView === 'chat' ? 'graph' : 'chat');
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Mobile sidebar toggle
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Simple toggle functions that only affect their respective panel
  const toggleLeftPanel = () => {
    if (isMobile) {
      toggleMobileView();
      return;
    }

    if (isLeftPanelCollapsed) {
      // If collapsed, expand it
      leftPanelRef.current?.expand();
      setIsLeftPanelCollapsed(false);
    } else {
      // If right panel is already collapsed, expand it instead of collapsing this one
      if (isRightPanelCollapsed) {
        rightPanelRef.current?.expand();
        setIsRightPanelCollapsed(false);
      } else {
        // Otherwise collapse this panel
        leftPanelRef.current?.collapse();
        setIsLeftPanelCollapsed(true);
      }
    }
  };

  const toggleRightPanel = () => {
    if (isMobile) {
      toggleMobileView();
      return;
    }

    if (isRightPanelCollapsed) {
      // If collapsed, expand it
      rightPanelRef.current?.expand();
      setIsRightPanelCollapsed(false);
    } else {
      // If left panel is already collapsed, expand it instead of collapsing this one
      if (isLeftPanelCollapsed) {
        leftPanelRef.current?.expand();
        setIsLeftPanelCollapsed(false);
      } else {
        // Otherwise collapse this panel
        rightPanelRef.current?.collapse();
        setIsRightPanelCollapsed(true);
      }
    }
  };

  // Get messages for the active chat, or empty array if in pending chat mode
  const messages = isPendingChat ? [] : getActiveChatMessages();

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Add TopBar component */}
      <TopBar onToggleSidebar={toggleMobileSidebar} />

      {/* Mobile View Toggle */}
      {isMobile && (
        <div
          className="flex justify-center p-2 bg-opacity-80"
          style={{ backgroundColor: 'var(--card-background)' }}
        >
          <button
            onClick={toggleMobileView}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent-foreground)',
              color: 'white',
            }}
          >
            Switch to {activeView === 'chat' ? 'Graph' : 'Chat'}
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Mobile sidebar backdrop - only shown when mobile sidebar is open */}
        {isMobile && isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleMobileSidebar}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar - hidden on mobile unless toggled */}
        {(!isMobile || isMobileSidebarOpen) && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            onCreateDraftChat={() => {
              // Set pending chat mode
              setIsPendingChat(true);
              // Set active chat to null
              setActiveChat(null);
              // Also set the graph store's active chat to null
              setActiveGraphChat(null);
              // Close mobile sidebar after selection
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            onSelectChat={() => {
              // Exit pending chat mode when an existing chat is selected
              setIsPendingChat(false);
              // Close mobile sidebar after selection
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
          />
        )}

        {isMobile ? (
          // Mobile layout - single view at a time
          <div className="flex-1">
            {activeView === 'chat' ? (
              <div className="h-full p-3">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            ) : (
              <div className="h-full p-3">
                <GraphPanel />
              </div>
            )}
          </div>
        ) : (
          // Desktop layout - panel group with resizable panels
          <div className="flex-1">
            <PanelGroup direction="horizontal" className="h-full">
              {/* Left panel - Chat */}
              <Panel
                defaultSize={50}
                collapsible={true}
                collapsedSize={0}
                ref={leftPanelRef}
                onCollapse={() => {
                  setIsLeftPanelCollapsed(true);
                }}
                onExpand={() => {
                  setIsLeftPanelCollapsed(false);
                }}
                className="relative"
                minSize={30}
              >
                {/* Toggle button - always in the same position regardless of collapse state */}
                <button
                  onClick={toggleLeftPanel}
                  className="absolute top-2 right-0 z-10 p-1 rounded-l-md"
                  style={{
                    backgroundColor: 'var(--accent-foreground)',
                    color: 'white',
                  }}
                  aria-label={
                    isLeftPanelCollapsed
                      ? 'Expand left panel'
                      : 'Collapse left panel'
                  }
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <div className="h-full p-4">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              </Panel>

              {/* Resizer */}
              <PanelResizeHandle
                className={`${
                  isLeftPanelCollapsed || isRightPanelCollapsed
                    ? 'w-0'
                    : 'w-1.5'
                } transition-colors hover:bg-accent-foreground active:bg-accent-foreground`}
                style={{
                  backgroundColor: 'var(--card-border)',
                }}
              />

              {/* Right panel - Graph */}
              <Panel
                defaultSize={50}
                collapsible={true}
                collapsedSize={0}
                ref={rightPanelRef}
                onCollapse={() => {
                  setIsRightPanelCollapsed(true);
                }}
                onExpand={() => {
                  setIsRightPanelCollapsed(false);
                }}
                className="relative"
                minSize={30}
              >
                {/* Toggle button - always in the same position regardless of collapse state */}
                <button
                  onClick={toggleRightPanel}
                  className="absolute top-2 left-0 z-10 p-1 rounded-r-md"
                  style={{
                    backgroundColor: 'var(--accent-foreground)',
                    color: 'white',
                  }}
                  aria-label={
                    isRightPanelCollapsed
                      ? 'Expand right panel'
                      : 'Collapse right panel'
                  }
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>

                <div className="h-full p-4">
                  <GraphPanel />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        )}
      </div>
    </div>
  );
}
