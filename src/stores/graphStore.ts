import { create } from 'zustand';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { AdjacencyList, processGraphData } from '../utils/graph/dataUtils';
import { getLayoutedElements } from '../utils/graph/layoutUtils';

interface GraphState {
  // State
  nodes: Node[];
  edges: Edge[];
  adjacencyList: AdjacencyList;

  // Actions
  setGraphData: (data: string[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  resetGraph: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  adjacencyList: {},

  // Actions
  setGraphData: (data: string[]) => {
    const { nodes: currentNodes, edges: currentEdges, adjacencyList } = get();

    // Process the new graph data
    const {
      nodes: processedNodes,
      edges: processedEdges,
      updatedAdjacencyList,
    } = processGraphData(data, currentNodes, currentEdges, adjacencyList);

    // Check if there are any new nodes that need positioning
    const hasNewNodes = processedNodes.some(
      (node) =>
        !currentNodes.some((existingNode) => existingNode.id === node.id)
    );

    // Only apply layout if there are new nodes or node count has changed
    if (hasNewNodes || processedNodes.length !== currentNodes.length) {
      const layoutedNodes = getLayoutedElements(processedNodes, processedEdges);
      set({
        nodes: layoutedNodes,
        edges: processedEdges,
        adjacencyList: updatedAdjacencyList,
      });
    } else {
      set({
        nodes: processedNodes,
        edges: processedEdges,
        adjacencyList: updatedAdjacencyList,
      });
    }
  },

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  resetGraph: () => {
    set({
      nodes: [],
      edges: [],
      adjacencyList: {},
    });
  },
}));
