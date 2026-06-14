export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  distance: number;
  traffic: TrafficLevel;
}

export type TrafficLevel = 'normal' | 'moderate' | 'heavy' | 'blocked';

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AlgorithmResult {
  path: string[];
  distance: number;
  visitedNodes: string[];
  executionTime: number;
}

export type AlgorithmType = 'dijkstra' | 'bfs' | 'dfs' | 'astar';

export interface RouteHistory {
  id: string;
  source: string;
  destination: string;
  algorithm: AlgorithmType;
  distance: number;
  path: string[];
  timestamp: number;
  trafficConditions: Record<string, TrafficLevel>;
}

export const TRAFFIC_MULTIPLIER: Record<TrafficLevel, number> = {
  normal: 1,
  moderate: 1.5,
  heavy: 2.5,
  blocked: Infinity,
};

export const TRAFFIC_COLORS: Record<TrafficLevel, string> = {
  normal: '#22c55e',
  moderate: '#eab308',
  heavy: '#ef4444',
  blocked: '#6b7280',
};

export const ALGORITHM_NAMES: Record<AlgorithmType, string> = {
  dijkstra: "Dijkstra's Algorithm",
  bfs: 'Breadth First Search (BFS)',
  dfs: 'Depth First Search (DFS)',
  astar: 'A* Search',
};
