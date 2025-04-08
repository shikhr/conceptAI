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
  } = useChatStore();
  const {
    setGraphData,
    getGraphDataString,
    setActiveChat: setActiveGraphChat,
    getActiveGraph,
  } = useGraphStore();

  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'graph'>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Initialize theme based on saved preference or system preference
    initTheme();

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Create initial chat if none exists
    if (!activeChat) {
      const newChatId = addChat('New Conversation');
      setActiveGraphChat(newChatId);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [initTheme, addChat, activeChat, setActiveGraphChat]);

  // Independent state for each panel's collapse state
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // References to Panel components
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Function to handle new messages
  const handleSendMessage = async (message: string) => {
    if (!activeChat) return;

    // Add user message to chat history
    const userMessage = { role: 'user', content: message };
    addMessage(userMessage);

    try {
      // Get current messages and graph data
      const messages = getActiveChatMessages();
      const currentGraphStrings = getGraphDataString();
      const currentGraph = currentGraphStrings.join('\n');

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
      addMessage(assistantMessage);

      // Update graph data only if response contains graph data
      if (data.graph && data.graph.length > 0) {
        setGraphData(data.graph);
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
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      });
    }
  };

  // Toggle function for mobile view
  const toggleMobileView = () => {
    setActiveView(activeView === 'chat' ? 'graph' : 'chat');
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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

  const messages = getActiveChatMessages();
  const activeGraphData = getActiveGraph();

  // If there's no active chat, just show the sidebar
  if (!activeChat) {
    return (
      <div
        className="h-screen flex flex-col"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <TopBar />
        <div className="flex-1 flex">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
          <div
            className="flex-1 flex items-center justify-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Active Chat</h2>
              <p>Select a chat from the sidebar or create a new one</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Add TopBar component */}
      <TopBar />

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
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />

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
