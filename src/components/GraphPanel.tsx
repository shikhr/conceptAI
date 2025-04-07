'use client';

import { useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../stores/graphStore';

interface GraphPanelProps {
  graphData: string[];
}

export default function GraphPanel({ graphData }: GraphPanelProps) {
  // Use the graph store instead of local state
  const { nodes, edges, onNodesChange, onEdgesChange, setGraphData } =
    useGraphStore();

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
      <h2
        className="text-xl font-bold p-4 border-b"
        style={{ borderColor: 'var(--card-border)' }}
      >
        Concept Graph
      </h2>
      <div className="h-[calc(100%-3.5rem)] w-full">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background
              color="var(--graph-background-pattern)"
              gap={16}
              size={1}
            />
          </ReactFlow>
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Concepts will appear here as you learn
          </div>
        )}
      </div>
    </div>
  );
}
