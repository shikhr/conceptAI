import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { AdjacencyList, processGraphData } from '../utils/graph/dataUtils';
import { getLayoutedElements } from '../utils/graph/layoutUtils';

// Define graph data interface
interface GraphData {
  nodes: Node[];
  edges: Edge[];
  adjacencyList: AdjacencyList;
}

interface GraphState {
  // State
  graphs: Record<string, GraphData>;
  activeChat: string | null;

  // Actions
  setActiveChat: (chatId: string) => void;
  ensureGraphExists: (chatId: string) => void;
  setGraphData: (data: string[], chatId?: string) => void;
  onNodesChange: (changes: NodeChange[], chatId?: string) => void;
  onEdgesChange: (changes: EdgeChange[], chatId?: string) => void;
  resetGraph: (chatId?: string) => void;
  getGraphDataString: (chatId?: string) => string[];
  getActiveGraph: () => GraphData | null;
  deleteGraph: (chatId: string) => void;
}

const emptyGraphData: GraphData = {
  nodes: [],
  edges: [],
  adjacencyList: {},
};

export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      // Initial state
      graphs: {},
      activeChat: null,

      // Actions
      setActiveChat: (chatId: string) => {
        // Ensure graph exists for this chat
        get().ensureGraphExists(chatId);
        set({ activeChat: chatId });
      },

      ensureGraphExists: (chatId: string) => {
        set((state) => {
          if (!state.graphs[chatId]) {
            return {
              graphs: {
                ...state.graphs,
                [chatId]: { ...emptyGraphData },
              },
            };
          }
          return state;
        });
      },

      getActiveGraph: () => {
        const { graphs, activeChat } = get();
        if (!activeChat || !graphs[activeChat]) return null;
        return graphs[activeChat];
      },

      setGraphData: (data: string[], chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        // Ensure graph exists
        get().ensureGraphExists(targetChatId);

        set((state) => {
          const currentGraph = state.graphs[targetChatId] || {
            ...emptyGraphData,
          };

          // Process the new graph data
          const {
            nodes: processedNodes,
            edges: processedEdges,
            updatedAdjacencyList,
          } = processGraphData(
            data,
            currentGraph.nodes,
            currentGraph.edges,
            currentGraph.adjacencyList
          );

          // Check if there are any new nodes that need positioning
          const hasNewNodes = processedNodes.some(
            (node) =>
              !currentGraph.nodes.some(
                (existingNode) => existingNode.id === node.id
              )
          );

          // Only apply layout if there are new nodes or node count has changed
          const updatedNodes =
            hasNewNodes || processedNodes.length !== currentGraph.nodes.length
              ? getLayoutedElements(processedNodes, processedEdges)
              : processedNodes;

          return {
            graphs: {
              ...state.graphs,
              [targetChatId]: {
                nodes: updatedNodes,
                edges: processedEdges,
                adjacencyList: updatedAdjacencyList,
              },
            },
          };
        });
      },

      // Convert adjacency list to string array in format "NODE1::NODE2"
      getGraphDataString: (chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return [];

        const graph = get().graphs[targetChatId];
        if (!graph) return [];

        const { adjacencyList } = graph;
        const result: string[] = [];

        Object.entries(adjacencyList).forEach(([sourceNode, connections]) => {
          connections.forEach((targetNode) => {
            result.push(`${sourceNode}::${targetNode}`);
          });
        });

        return result;
      },

      onNodesChange: (changes: NodeChange[], chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        set((state) => {
          const currentGraph = state.graphs[targetChatId];
          if (!currentGraph) return state;

          return {
            graphs: {
              ...state.graphs,
              [targetChatId]: {
                ...currentGraph,
                nodes: applyNodeChanges(changes, currentGraph.nodes),
              },
            },
          };
        });
      },

      onEdgesChange: (changes: EdgeChange[], chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        set((state) => {
          const currentGraph = state.graphs[targetChatId];
          if (!currentGraph) return state;

          return {
            graphs: {
              ...state.graphs,
              [targetChatId]: {
                ...currentGraph,
                edges: applyEdgeChanges(changes, currentGraph.edges),
              },
            },
          };
        });
      },

      resetGraph: (chatId?: string) => {
        const targetChatId = chatId || get().activeChat;
        if (!targetChatId) return;

        set((state) => ({
          graphs: {
            ...state.graphs,
            [targetChatId]: { ...emptyGraphData },
          },
        }));
      },

      deleteGraph: (chatId: string) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [chatId]: _, ...updatedGraphs } = state.graphs;
          return { graphs: updatedGraphs };
        });
      },
    }),
    {
      name: 'graph-storage', // unique name for localStorage key
    }
  )
);
