'use client';

import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../stores/graphStore';
import { useThemeStore } from '../stores/themeStore';
import { PiChat, PiGraph, PiPaperPlaneRightBold } from 'react-icons/pi';
import { useState, useRef } from 'react';

interface GraphPanelProps {
  activeView?: 'chat' | 'graph';
  toggleMobileView?: () => void;
  onSendMessage?: (message: string) => void;
}

export default function GraphPanel({
  activeView,
  toggleMobileView,
  onSendMessage,
}: GraphPanelProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the graph store with nodes and edges
  const { getActiveGraph, onNodesChange, onEdgesChange } = useGraphStore();

  // Use the theme store
  const { isDarkMode } = useThemeStore();

  // Get the active graph data
  const activeGraph = getActiveGraph();
  const nodes = activeGraph?.nodes || [];
  const edges = activeGraph?.edges || [];

  // CSS-based media query for responsive ReactFlow configuration
  const isMobileMedia =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px)').matches;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onSendMessage) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <div
          className="h-full w-full rounded-lg shadow"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)',
            color: 'var(--card-foreground)',
          }}
        >
          <div className="h-full w-full">
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                proOptions={{ hideAttribution: true }}
                colorMode={isDarkMode ? 'dark' : 'light'}
                nodesFocusable={!isMobileMedia}
                edgesFocusable={!isMobileMedia}
                minZoom={isMobileMedia ? 0.5 : 0.75}
                maxZoom={isMobileMedia ? 2 : 4}
              >
                <Controls
                  showInteractive={!isMobileMedia}
                  className="md:text-base text-xs md:p-2 p-1"
                />
                <Background gap={isMobileMedia ? 12 : 16} size={1} />
              </ReactFlow>
            ) : (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span className="text-sm md:text-base">
                  Concepts will appear here as you learn
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view - Show both toggle button and input form when on graph view */}
      {activeView === 'graph' && toggleMobileView && (
        <div className="md:hidden mt-2 space-y-2">
          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 p-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              style={
                {
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--card-foreground)',
                  borderColor: 'var(--card-border)',
                  '--tw-ring-color': 'var(--accent-foreground)',
                } as React.CSSProperties
              }
            />
            {/* Toggle button */}
            <button
              type="button"
              onClick={toggleMobileView}
              className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
              style={
                {
                  backgroundColor: 'var(--accent-foreground)',
                  color: 'white',
                  '--tw-ring-color': 'var(--accent-foreground)',
                } as React.CSSProperties
              }
              aria-label="Switch to Chat"
            >
              <PiChat />
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
              style={
                {
                  backgroundColor: !input.trim()
                    ? 'var(--accent-background)'
                    : 'var(--accent-foreground)',
                  color: !input.trim() ? 'var(--muted-foreground)' : 'white',
                  '--tw-ring-color': 'var(--accent-foreground)',
                } as React.CSSProperties
              }
            >
              <PiPaperPlaneRightBold className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Keep the original toggle button for backward compatibility */}
      {toggleMobileView && activeView && activeView !== 'graph' && (
        <div className="md:hidden flex justify-end mt-2">
          <button
            onClick={toggleMobileView}
            className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
            style={
              {
                backgroundColor: 'var(--accent-foreground)',
                color: 'white',
                '--tw-ring-color': 'var(--accent-foreground)',
              } as React.CSSProperties
            }
            aria-label={`Switch to Graph`}
          >
            <PiGraph />
          </button>
        </div>
      )}
    </div>
  );
}
