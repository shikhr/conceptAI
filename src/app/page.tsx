'use client';

import { useState, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ChatPanel from '@/components/ChatPanel';
import GraphPanel from '@/components/GraphPanel';
import TopBar from '@/components/TopBar';

export default function Home() {
  // State to manage chat history and graph data
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [graphData, setGraphData] = useState<string[]>([]);

  // Independent state for each panel's collapse state
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // References to Panel components
  const leftPanelRef = useRef<any>(null);
  const rightPanelRef = useRef<any>(null);

  // Function to handle new messages
  const handleSendMessage = async (message: string) => {
    // Add user message to chat history
    const newChatHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newChatHistory);

    try {
      // Prepare the current graph data for the API request
      const currentGraph = graphData.join('\n');

      // Call API with the current graph and user query
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newChatHistory,
          graph: currentGraph,
          query: message,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Update chat history with assistant's response
      setChatHistory([
        ...newChatHistory,
        { role: 'assistant', content: data.response },
      ]);

      // Update graph data
      if (data.graph && data.graph.length > 0) {
        setGraphData(data.graph);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([
        ...newChatHistory,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ]);
    }
  };

  // Simple toggle functions that only affect their respective panel
  const toggleLeftPanel = () => {
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

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Add TopBar component */}
      <TopBar />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
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
                messages={chatHistory}
                onSendMessage={handleSendMessage}
              />
            </div>
          </Panel>

          {/* Resizer */}
          <PanelResizeHandle
            className={`${
              isLeftPanelCollapsed || isRightPanelCollapsed ? 'w-0' : 'w-1.5'
            } transition-colors`}
            style={{
              backgroundColor: 'var(--card-border)',
              '&:hover': { backgroundColor: 'var(--accent-foreground)' },
              '&:active': { backgroundColor: 'var(--accent-foreground)' },
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
              <GraphPanel graphData={graphData} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
