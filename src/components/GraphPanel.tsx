'use client';

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphPanelProps {
  graphData: string[];
}

// Adjacency list representation of the graph
interface AdjacencyList {
  [nodeId: string]: string[]; // Maps node ID to array of connected node IDs
}

const nodeWidth = 150;
const nodeHeight = 40;

export default function GraphPanel({ graphData }: GraphPanelProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const adjacencyListRef = useRef<AdjacencyList>({});

  // Convert raw graph data to adjacency list
  const buildAdjacencyList = useCallback((data: string[]): AdjacencyList => {
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
  }, []);

  // Merge new adjacency list with existing one
  const mergeAdjacencyLists = useCallback(
    (existingList: AdjacencyList, newList: AdjacencyList): AdjacencyList => {
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
    },
    []
  );

  // Process graph data into nodes and edges with intelligent merging
  const processGraphData = useCallback(
    (data: string[], existingNodes: Node[], existingEdges: Edge[]) => {
      if (!data.length) return { nodes: existingNodes, edges: existingEdges };

      // Build adjacency list from new data
      const newAdjacencyList = buildAdjacencyList(data);

      // Merge with existing adjacency list
      const mergedAdjacencyList = mergeAdjacencyLists(
        adjacencyListRef.current,
        newAdjacencyList
      );
      adjacencyListRef.current = mergedAdjacencyList;

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
          // Create new node
          nodesArray.push({
            id: nodeId,
            data: { label: nodeName },
            position: { x: 0, y: 0 }, // Initial position will be updated by layout algorithm
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            style: { width: nodeWidth, height: nodeHeight },
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

      // Check if there are any new nodes that need positioning
      const newNodes = nodesArray.filter(
        (node) =>
          !existingNodes.some((existingNode) => existingNode.id === node.id)
      );

      if (newNodes.length > 0) {
        // Only position new nodes or reposition the entire graph if there are significant changes
        const shouldRepositionAll = newNodes.length > existingNodes.length / 2;

        if (shouldRepositionAll) {
          // Reposition all nodes if there are many new nodes
          positionNodes(nodesArray, edgesArray);
        } else {
          // Position only new nodes relative to their connections
          positionNewNodes(newNodes, nodesArray, edgesArray);
        }
      }

      return { nodes: nodesArray, edges: edgesArray };
    },
    [buildAdjacencyList, mergeAdjacencyLists]
  );

  // Position only new nodes, keeping existing nodes in place
  const positionNewNodes = (
    newNodes: Node[],
    allNodes: Node[],
    edges: Edge[]
  ) => {
    // Set initial positions for new nodes based on connected nodes
    newNodes.forEach((node) => {
      // Find connected nodes (both source and target connections)
      const connectedNodeIds = new Set<string>();

      edges.forEach((edge) => {
        if (edge.source === node.id) connectedNodeIds.add(edge.target);
        if (edge.target === node.id) connectedNodeIds.add(edge.source);
      });

      const connectedNodes = allNodes.filter(
        (n) =>
          connectedNodeIds.has(n.id) &&
          !newNodes.some((newNode) => newNode.id === n.id)
      );

      if (connectedNodes.length > 0) {
        // Position near the average position of connected nodes
        const avgX =
          connectedNodes.reduce((sum, n) => sum + n.position.x, 0) /
          connectedNodes.length;
        const avgY =
          connectedNodes.reduce((sum, n) => sum + n.position.y, 0) /
          connectedNodes.length;

        // Add a small random offset to avoid overlap
        node.position = {
          x: avgX + (Math.random() * 100 - 50),
          y: avgY + (Math.random() * 100 - 50),
        };
      } else {
        // If no connections to existing nodes, place randomly
        node.position = {
          x: Math.random() * 800,
          y: Math.random() * 600,
        };
      }
    });

    // Run a few iterations of force-directed layout just for the new nodes
    for (let i = 0; i < 20; i++) {
      // Apply repulsive forces between new nodes and all nodes
      for (const newNode of newNodes) {
        for (const otherNode of allNodes) {
          if (newNode.id !== otherNode.id) {
            const dx = otherNode.position.x - newNode.position.x;
            const dy = otherNode.position.y - newNode.position.y;
            const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const force = 1000 / (distance * distance);

            if (newNodes.some((n) => n.id === otherNode.id)) {
              // Both are new nodes, both can move
              newNode.position.x -= (dx / distance) * force * 0.5;
              newNode.position.y -= (dy / distance) * force * 0.5;
              otherNode.position.x += (dx / distance) * force * 0.5;
              otherNode.position.y += (dy / distance) * force * 0.5;
            } else {
              // Only new node moves, existing node stays fixed
              newNode.position.x -= (dx / distance) * force;
              newNode.position.y -= (dy / distance) * force;
            }
          }
        }
      }

      // Apply attractive forces along edges for new nodes
      edges.forEach((edge) => {
        const sourceNode = allNodes.find((node) => node.id === edge.source);
        const targetNode = allNodes.find((node) => node.id === edge.target);

        if (sourceNode && targetNode) {
          const isSourceNew = newNodes.some((n) => n.id === sourceNode.id);
          const isTargetNew = newNodes.some((n) => n.id === targetNode.id);

          if (isSourceNew || isTargetNew) {
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const force = distance / 10;

            if (isSourceNew && !isTargetNew) {
              // Only source node is new and can move
              sourceNode.position.x += (dx / distance) * force;
              sourceNode.position.y += (dy / distance) * force;
            } else if (!isSourceNew && isTargetNew) {
              // Only target node is new and can move
              targetNode.position.x -= (dx / distance) * force;
              targetNode.position.y -= (dy / distance) * force;
            } else if (isSourceNew && isTargetNew) {
              // Both nodes are new and can move
              sourceNode.position.x += (dx / distance) * force * 0.5;
              sourceNode.position.y += (dy / distance) * force * 0.5;
              targetNode.position.x -= (dx / distance) * force * 0.5;
              targetNode.position.y -= (dy / distance) * force * 0.5;
            }
          }
        }
      });
    }
  };

  // Simple force-directed layout algorithm for all nodes
  const positionNodes = (nodes: Node[], edges: Edge[]) => {
    // Set initial random positions
    nodes.forEach((node) => {
      node.position = {
        x: Math.random() * 800,
        y: Math.random() * 600,
      };
    });

    // Run 50 iterations of force-directed layout
    for (let i = 0; i < 50; i++) {
      // Apply repulsive forces between all nodes
      for (let j = 0; j < nodes.length; j++) {
        for (let k = 0; k < nodes.length; k++) {
          if (j !== k) {
            const dx = nodes[k].position.x - nodes[j].position.x;
            const dy = nodes[k].position.y - nodes[j].position.y;
            const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const force = 2000 / distance;

            nodes[j].position.x -= (dx / distance) * force;
            nodes[j].position.y -= (dy / distance) * force;
            nodes[k].position.x += (dx / distance) * force;
            nodes[k].position.y += (dy / distance) * force;
          }
        }
      }

      // Apply attractive forces along edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        const targetNode = nodes.find((node) => node.id === edge.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = distance / 10;

          sourceNode.position.x += (dx / distance) * force;
          sourceNode.position.y += (dy / distance) * force;
          targetNode.position.x -= (dx / distance) * force;
          targetNode.position.y -= (dy / distance) * force;
        }
      });
    }

    // Center the graph
    const centerX =
      nodes.reduce((sum, node) => sum + node.position.x, 0) / nodes.length;
    const centerY =
      nodes.reduce((sum, node) => sum + node.position.y, 0) / nodes.length;

    nodes.forEach((node) => {
      node.position.x += 400 - centerX;
      node.position.y += 300 - centerY;
    });
  };

  // Update nodes and edges when graph data changes
  useEffect(() => {
    if (graphData.length) {
      // Use the adjacencyListRef for comparison to prevent infinite loops
      const newAdjacencyList = buildAdjacencyList(graphData);
      const updatedAdjacencyList = mergeAdjacencyLists(
        adjacencyListRef.current,
        newAdjacencyList
      );

      // Only update if the adjacency list has actually changed
      if (
        JSON.stringify(updatedAdjacencyList) !==
        JSON.stringify(adjacencyListRef.current)
      ) {
        adjacencyListRef.current = updatedAdjacencyList;
        const { nodes: newNodes, edges: newEdges } = processGraphData(
          graphData,
          nodes,
          edges
        );
        setNodes(newNodes);
        setEdges(newEdges);
      }
    }
    // Remove nodes and edges from dependencies to prevent infinite render loops
  }, [
    graphData,
    processGraphData,
    buildAdjacencyList,
    mergeAdjacencyLists,
    setNodes,
    setEdges,
  ]);

  return (
    <div className="h-full w-full bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold p-4 border-b">Concept Graph</h2>
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
            <Background />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Concepts will appear here as you learn
          </div>
        )}
      </div>
    </div>
  );
}
