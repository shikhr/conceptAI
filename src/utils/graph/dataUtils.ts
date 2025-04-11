import { Node, Edge } from '@xyflow/react';
import { NODE_WIDTH, NODE_HEIGHT } from './layoutUtils';

// Adjacency list representation of the graph
export interface AdjacencyList {
  [nodeId: string]: string[]; // Maps node ID to array of connected node IDs
}

/**
 * Formats node names to follow standardized format:
 * - All uppercase letters
 * - Words separated by underscores
 */
export const formatNodeName = (name: string): string => {
  return name.trim().toUpperCase().replace(/\s+/g, '_');
};

/**
 * Converts raw graph data strings into an adjacency list representation
 * Handles bidirectional edges by ensuring relationships are symmetrical
 */
export const buildAdjacencyList = (data: string[]): AdjacencyList => {
  const adjacencyList: AdjacencyList = {};

  // First pass: build the basic adjacency list
  data.forEach((line) => {
    // Extract source and target, then format them
    const [sourceRaw, targetRaw] = line.split('::').map((node) => node.trim());
    const source = formatNodeName(sourceRaw);
    const target = formatNodeName(targetRaw);

    // Skip self-loops
    if (source === target) {
      return;
    }

    if (!adjacencyList[source]) {
      adjacencyList[source] = [];
    }

    // Add target to source's adjacency list if it's not already there
    if (!adjacencyList[source].includes(target)) {
      adjacencyList[source].push(target);
    }

    // Ensure target also exists in the adjacency list
    if (!adjacencyList[target]) {
      adjacencyList[target] = [];
    }
  });

  // Second pass: ensure bidirectional connections
  // If A→B exists, make sure B→A also exists
  Object.entries(adjacencyList).forEach(([source, targets]) => {
    targets.forEach((target) => {
      // If this is a one-way connection, make it bidirectional
      if (!adjacencyList[target].includes(source)) {
        adjacencyList[target].push(source);
      }
    });
  });

  return adjacencyList;
};

/**
 * Merges a new adjacency list with an existing one
 * Maintains bidirectional connections when merging
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

          // Maintain bidirectional relationship
          if (!mergedList[connection]) {
            mergedList[connection] = [nodeId];
          } else if (!mergedList[connection].includes(nodeId)) {
            mergedList[connection].push(nodeId);
          }
        }
      });
    }
  });

  return mergedList;
};

/**
 * Processes graph data and converts it to ReactFlow nodes and edges
 * Prevents duplicate edges from being created for bidirectional connections
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
  // Track processed edges to avoid duplicates
  const processedEdges = new Set<string>();

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
        type: 'default',
        data: { label: nodeName },
        position: { x: 0, y: 0 },
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }

    // Process edges for this node
    mergedAdjacencyList[nodeName].forEach((targetName) => {
      // Create a canonical edge ID that's the same regardless of direction
      // by sorting the node names alphabetically
      const nodeNames = [nodeName, targetName].sort();
      const canonicalEdgeId = `edge-${nodeNames[0]}-${nodeNames[1]}`;

      // Skip if we've already processed this edge
      if (processedEdges.has(canonicalEdgeId)) {
        return;
      }

      const targetId = `node-${targetName}`;

      // Mark this edge as processed
      processedEdges.add(canonicalEdgeId);

      // Use the existing edge if it exists (with either direction)
      const standardEdgeId = `edge-${nodeName}-${targetName}`;
      const reverseEdgeId = `edge-${targetName}-${nodeName}`;

      if (existingEdgesMap.has(canonicalEdgeId)) {
        edgesArray.push(existingEdgesMap.get(canonicalEdgeId)!);
      } else if (existingEdgesMap.has(standardEdgeId)) {
        edgesArray.push(existingEdgesMap.get(standardEdgeId)!);
      } else if (existingEdgesMap.has(reverseEdgeId)) {
        edgesArray.push(existingEdgesMap.get(reverseEdgeId)!);
      } else {
        // Create new edge using the canonical ID
        edgesArray.push({
          id: canonicalEdgeId,
          source: nodeId,
          target: targetId,
          animated: true,
          // Use the bidirectional arrow type if available in your flow library
          type: 'bidirectional',
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
