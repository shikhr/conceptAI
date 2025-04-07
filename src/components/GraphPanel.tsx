'use client';

import { useEffect, useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../stores/graphStore';
import { useThemeStore } from '../stores/themeStore';

interface GraphPanelProps {
  graphData: string[];
}

export default function GraphPanel({ graphData }: GraphPanelProps) {
  // Use the graph store
  const { nodes, edges, onNodesChange, onEdgesChange, setGraphData } =
    useGraphStore();

  // Use the theme store
  const { isDarkMode } = useThemeStore();

  // State for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Update graph when data changes
  useEffect(() => {
    if (graphData.length) {
      setGraphData(graphData);
    }
  }, [graphData, setGraphData]);

  return (
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
            nodesFocusable={!isMobile}
            edgesFocusable={!isMobile}
            minZoom={isMobile ? 0.5 : 0.75}
            maxZoom={isMobile ? 2 : 4}
          >
            <Controls
              showInteractive={!isMobile}
              style={{
                fontSize: isMobile ? '0.75rem' : '1rem',
                padding: isMobile ? '4px' : '8px',
              }}
            />
            <Background gap={isMobile ? 12 : 16} size={1} />
          </ReactFlow>
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className={isMobile ? 'text-sm' : 'text-base'}>
              Concepts will appear here as you learn
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
