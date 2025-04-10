'use client';

import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../stores/graphStore';
import { useThemeStore } from '../stores/themeStore';
import { PiGraph } from 'react-icons/pi';
import InputBar from './InputBar';

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

  const handleSubmit = (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
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

      {/* Mobile view - Show input bar when on graph view */}
      {activeView === 'graph' && toggleMobileView && (
        <div
          className="md:hidden pt-2"
          style={{
            backgroundColor: 'var(--card-background)',
          }}
        >
          <InputBar
            onSubmit={handleSubmit}
            toggleMobileView={toggleMobileView}
            activeView={activeView}
          />
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
