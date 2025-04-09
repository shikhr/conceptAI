'use client';

import { useState, useRef, useEffect } from 'react';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

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

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

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
  const [activeView, setActiveView] = useState<'chat' | 'graph'>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Independent state for each panel's collapse state
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // References to Panel components
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Ensure sidebar is not collapsed on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Function to process a message with the API
  const processMessage = async (message: string, chatId: string) => {
    try {
      const messages = getActiveChatMessages();
      const currentGraphStrings = getGraphDataString();
      const currentGraph = currentGraphStrings.join('\n');

      const userMessage = { role: 'user', content: message };
      addMessage(userMessage, chatId);

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

      const assistantMessage = { role: 'assistant', content: data.response };
      addMessage(assistantMessage, chatId);

      if (data.graph && data.graph.length > 0) {
        setGraphData(data.graph, chatId);
      }

      const currentChat = getActiveChat();
      if (currentChat && currentChat.messages.length <= 2) {
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
    if (isPendingChat) {
      const newChatId = addChat('New Chat');
      setActiveChat(newChatId);
      setActiveGraphChat(newChatId);
      setIsPendingChat(false);
      processMessage(message, newChatId);
      return;
    }

    const chatId = activeChat;
    if (!chatId) {
      const newChatId = addChat('New Chat');
      setActiveGraphChat(newChatId);
      processMessage(message, newChatId);
      return;
    }

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

  // Panel toggle functions
  const toggleLeftPanel = () => {
    if (isLeftPanelCollapsed) {
      leftPanelRef.current?.expand();
      setIsLeftPanelCollapsed(false);
    } else {
      if (isRightPanelCollapsed) {
        rightPanelRef.current?.expand();
        setIsRightPanelCollapsed(false);
      } else {
        leftPanelRef.current?.collapse();
        setIsLeftPanelCollapsed(true);
      }
    }
  };

  const toggleRightPanel = () => {
    if (isRightPanelCollapsed) {
      rightPanelRef.current?.expand();
      setIsRightPanelCollapsed(false);
    } else {
      if (isLeftPanelCollapsed) {
        leftPanelRef.current?.expand();
        setIsLeftPanelCollapsed(false);
      } else {
        rightPanelRef.current?.collapse();
        setIsRightPanelCollapsed(true);
      }
    }
  };

  // Get messages for the active chat, or empty array if in pending chat mode
  const messages = isPendingChat ? [] : getActiveChatMessages();

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <TopBar onToggleSidebar={toggleMobileSidebar} />

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex relative">
        {/* Mobile sidebar backdrop */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 md:hidden ${
            isMobileSidebarOpen
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleMobileSidebar}
          aria-label="Close sidebar"
        />

        {/* Sidebar container */}
        <div
          className={`fixed md:relative inset-y-0 left-0 h-full z-40 md:z-0 transform transition-transform duration-300 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed && window.innerWidth >= 768}
            toggleSidebar={toggleSidebar}
            onCreateDraftChat={() => {
              setIsPendingChat(true);
              setActiveChat(null);
              setActiveGraphChat(null);
              setIsMobileSidebarOpen(false);
            }}
            onSelectChat={() => {
              setIsPendingChat(false);
              setIsMobileSidebarOpen(false);
            }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Mobile View */}
          <div className="md:hidden h-full">
            {activeView === 'chat' ? (
              <div className="h-full p-3">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  activeView={activeView}
                  toggleMobileView={toggleMobileView}
                />
              </div>
            ) : (
              <div className="h-full p-3">
                <GraphPanel
                  activeView={activeView}
                  toggleMobileView={toggleMobileView}
                />
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block h-full">
            <PanelGroup direction="horizontal" className="h-full">
              {/* Left panel - Chat */}
              <Panel
                defaultSize={50}
                collapsible={true}
                collapsedSize={0}
                ref={leftPanelRef}
                onCollapse={() => setIsLeftPanelCollapsed(true)}
                onExpand={() => setIsLeftPanelCollapsed(false)}
                className="relative"
                minSize={30}
              >
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
                  <FaChevronLeft className="h-5 w-5" />
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
                style={{ backgroundColor: 'var(--card-border)' }}
              />

              {/* Right panel - Graph */}
              <Panel
                defaultSize={50}
                collapsible={true}
                collapsedSize={0}
                ref={rightPanelRef}
                onCollapse={() => setIsRightPanelCollapsed(true)}
                onExpand={() => setIsRightPanelCollapsed(false)}
                className="relative"
                minSize={30}
              >
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
                  <FaChevronRight className="h-5 w-5" />
                </button>

                <div className="h-full p-4">
                  <GraphPanel />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
