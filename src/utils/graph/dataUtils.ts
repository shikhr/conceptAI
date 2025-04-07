import { Node, Edge } from '@xyflow/react';
import { NODE_WIDTH, NODE_HEIGHT } from './layoutUtils';

// Adjacency list representation of the graph
export interface AdjacencyList {
  [nodeId: string]: string[]; // Maps node ID to array of connected node IDs
}

/**
 * Converts raw graph data strings into an adjacency list representation
 */
export const buildAdjacencyList = (data: string[]): AdjacencyList => {
  const adjacencyList: AdjacencyList = {};

  data.forEach((line) => {
    const [source, target] = line.split('::').map((node) => node.trim());

    if (!adjacencyList[source]) {
      adjacencyList[source] = [];
    }

    // Add target to source's adjacency list if it's not already there
    if (!adjacencyList[source].includes(target)) {
      adjacencyList[source].push(target);
    }

    // Ensure target also exists in the adjacency list (even if it has no outgoing edges)
    if (!adjacencyList[target]) {
      adjacencyList[target] = [];
    }
  });

  return adjacencyList;
};

/**
 * Merges a new adjacency list with an existing one
 */
export const mergeAdjacencyLists = (
  existingList: AdjacencyList,
  newList: AdjacencyList
): AdjacencyList => {
  const mergedList: AdjacencyList = { ...existingList };

  // Add or update entries from the new list
  Object.entries(newList).forEach(([nodeId, connections]) => {
    if (!mergedList[nodeId]) {
      mergedList[nodeId] = [...connections];
    } else {
      // Add new connections that don't already exist
      connections.forEach((connection) => {
        if (!mergedList[nodeId].includes(connection)) {
          mergedList[nodeId].push(connection);
        }
      });
    }
  });

  return mergedList;
};

/**
 * Processes graph data and converts it to ReactFlow nodes and edges
 */
export const processGraphData = (
  data: string[],
  existingNodes: Node[],
  existingEdges: Edge[],
  adjacencyList: AdjacencyList
): { nodes: Node[]; edges: Edge[]; updatedAdjacencyList: AdjacencyList } => {
  if (!data.length)
    return {
      nodes: existingNodes,
      edges: existingEdges,
      updatedAdjacencyList: adjacencyList,
    };

  // Build adjacency list from new data
  const newAdjacencyList = buildAdjacencyList(data);

  // Merge with existing adjacency list
  const mergedAdjacencyList = mergeAdjacencyLists(
    adjacencyList,
    newAdjacencyList
  );

  // Create a map of existing nodes for quick lookup
  const existingNodesMap = new Map<string, Node>();
  existingNodes.forEach((node) => {
    // Extract the original node name from the node id (removing 'node-' prefix)
    const nodeName = node.id.replace('node-', '');
    existingNodesMap.set(nodeName, node);
  });

  // Create a map of existing edges for quick lookup
  const existingEdgesMap = new Map<string, Edge>();
  existingEdges.forEach((edge) => {
    existingEdgesMap.set(edge.id, edge);
  });

  const nodesArray: Node[] = [];
  const edgesArray: Edge[] = [];

  // Process all nodes from the merged adjacency list
  Object.keys(mergedAdjacencyList).forEach((nodeName) => {
    const nodeId = `node-${nodeName}`;

    if (existingNodesMap.has(nodeName)) {
      // Keep existing node with its position
      nodesArray.push(existingNodesMap.get(nodeName)!);
    } else {
      // Create new node with default position (will be updated by layout)
      nodesArray.push({
        id: nodeId,
        type: 'concept',
        data: { label: nodeName },
        position: { x: 0, y: 0 },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }

    // Process edges for this node
    mergedAdjacencyList[nodeName].forEach((targetName) => {
      const edgeId = `edge-${nodeName}-${targetName}`;
      const targetId = `node-${targetName}`;

      if (existingEdgesMap.has(edgeId)) {
        // Keep existing edge
        edgesArray.push(existingEdgesMap.get(edgeId)!);
      } else {
        // Create new edge
        edgesArray.push({
          id: edgeId,
          source: nodeId,
          target: targetId,
          animated: true,
        });
      }
    });
  });

  return {
    nodes: nodesArray,
    edges: edgesArray,
    updatedAdjacencyList: mergedAdjacencyList,
  };
};
