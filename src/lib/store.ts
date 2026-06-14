import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GraphNode, GraphEdge, TrafficLevel, RouteHistory, AlgorithmResult, AlgorithmType } from '@/types';
import { dijkstra, bfs, dfs, astar } from '@/lib/algorithms';
import { buildAdjacencyList } from '@/lib/graph';
import { TRAFFIC_MULTIPLIER } from '@/types';

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  history: RouteHistory[];
  selectedAlgorithm: AlgorithmType;

  addNode: (name: string, x: number, y: number) => void;
  updateNode: (id: string, updates: Partial<GraphNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (source: string, target: string, distance: number) => void;
  updateEdge: (id: string, updates: Partial<GraphEdge>) => void;
  removeEdge: (id: string) => void;
  setTraffic: (edgeId: string, traffic: TrafficLevel) => void;
  setAlgorithm: (algo: AlgorithmType) => void;

  findRoute: (source: string, destination: string) => AlgorithmResult | null;
  compareAlgorithms: (source: string, destination: string) => Record<AlgorithmType, AlgorithmResult>;

  loadSampleData: (data: { nodes: GraphNode[]; edges: GraphEdge[] }) => void;
  clearGraph: () => void;
  exportGraph: () => string;
  importGraph: (json: string) => void;
  clearHistory: () => void;

  // Undo/Redo
  undoStack: { nodes: GraphNode[]; edges: GraphEdge[] }[];
  redoStack: { nodes: GraphNode[]; edges: GraphEdge[] }[];
  pushState: () => void;
  undo: () => void;
  redo: () => void;
}

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem('route-graph');
    if (data) return JSON.parse(data);
  } catch {}
  return { nodes: [], edges: [], history: [] };
};

const saveToStorage = (nodes: GraphNode[], edges: GraphEdge[], history: RouteHistory[]) => {
  localStorage.setItem('route-graph', JSON.stringify({ nodes, edges, history }));
};

const initial = loadFromStorage();

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: initial.nodes ?? [],
  edges: initial.edges ?? [],
  history: initial.history ?? [],
  selectedAlgorithm: 'dijkstra',
  undoStack: [],
  redoStack: [],

  pushState: () => {
    const { nodes, edges, undoStack } = get();
    set({ undoStack: [...undoStack.slice(-50), { nodes: [...nodes], edges: [...edges] }], redoStack: [] });
  },

  undo: () => {
    const { undoStack, nodes, edges } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, { nodes: [...nodes], edges: [...edges] }],
      nodes: prev.nodes,
      edges: prev.edges,
    });
  },

  redo: () => {
    const { redoStack, nodes, edges } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, { nodes: [...nodes], edges: [...edges] }],
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  addNode: (name, x, y) => {
    const { pushState, nodes, edges, history } = get();
    pushState();
    const newNode: GraphNode = { id: uuidv4(), name, x, y };
    set({ nodes: [...nodes, newNode] });
    saveToStorage([...nodes, newNode], edges, history);
  },

  updateNode: (id, updates) => {
    const { nodes, edges, history } = get();
    const newNodes = nodes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    set({ nodes: newNodes });
    saveToStorage(newNodes, edges, history);
  },

  removeNode: (id) => {
    const { pushState, nodes, edges, history } = get();
    pushState();
    const newNodes = nodes.filter((n) => n.id !== id);
    const newEdges = edges.filter((e) => e.source !== id && e.target !== id);
    set({ nodes: newNodes, edges: newEdges });
    saveToStorage(newNodes, newEdges, history);
  },

  addEdge: (source, target, distance) => {
    const { pushState, nodes, edges, history } = get();
    pushState();
    const newEdge: GraphEdge = { id: uuidv4(), source, target, distance, traffic: 'normal' };
    set({ edges: [...edges, newEdge] });
    saveToStorage(nodes, [...edges, newEdge], history);
  },

  updateEdge: (id, updates) => {
    const { nodes, edges, history } = get();
    const newEdges = edges.map((e) => (e.id === id ? { ...e, ...updates } : e));
    set({ edges: newEdges });
    saveToStorage(nodes, newEdges, history);
  },

  removeEdge: (id) => {
    const { pushState, nodes, edges, history } = get();
    pushState();
    const newEdges = edges.filter((e) => e.id !== id);
    set({ edges: newEdges });
    saveToStorage(nodes, newEdges, history);
  },

  setTraffic: (edgeId, traffic) => {
    const { nodes, edges, history } = get();
    const newEdges = edges.map((e) => (e.id === edgeId ? { ...e, traffic } : e));
    set({ edges: newEdges });
    saveToStorage(nodes, newEdges, history);
  },

  setAlgorithm: (algo) => set({ selectedAlgorithm: algo }),

  findRoute: (source, destination) => {
    const { nodes, edges, selectedAlgorithm, history } = get();
    const adj = buildAdjacencyList(nodes, edges, TRAFFIC_MULTIPLIER);

    let result: AlgorithmResult | null = null;
    switch (selectedAlgorithm) {
      case 'dijkstra':
        result = dijkstra(nodes, adj, source, destination);
        break;
      case 'bfs':
        result = bfs(nodes, adj, source, destination);
        break;
      case 'dfs':
        result = dfs(nodes, adj, source, destination);
        break;
      case 'astar':
        result = astar(nodes, adj, source, destination);
        break;
    }

    if (result) {
      const trafficRecord: Record<string, TrafficLevel> = {};
      for (const e of edges) {
        trafficRecord[e.id] = e.traffic;
      }
      const entry: RouteHistory = {
        id: uuidv4(),
        source,
        destination,
        algorithm: selectedAlgorithm,
        distance: result.distance,
        path: result.path,
        timestamp: Date.now(),
        trafficConditions: trafficRecord,
      };
      const newHistory = [entry, ...history].slice(0, 100);
      set({ history: newHistory });
      saveToStorage(nodes, edges, newHistory);
    }

    return result;
  },

  compareAlgorithms: (source, destination) => {
    const { nodes, edges } = get();
    const adj = buildAdjacencyList(nodes, edges, TRAFFIC_MULTIPLIER);
    return {
      dijkstra: dijkstra(nodes, adj, source, destination),
      bfs: bfs(nodes, adj, source, destination),
      dfs: dfs(nodes, adj, source, destination),
      astar: astar(nodes.map((n) => ({ ...n, y: n.y })), adj, source, destination),
    };
  },

  loadSampleData: (data) => {
    const { history } = get();
    set({ nodes: data.nodes, edges: data.edges, undoStack: [], redoStack: [] });
    saveToStorage(data.nodes, data.edges, history);
  },

  clearGraph: () => {
    const { history } = get();
    set({ nodes: [], edges: [], undoStack: [], redoStack: [] });
    saveToStorage([], [], history);
  },

  exportGraph: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importGraph: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        const { history } = get();
        set({ nodes: data.nodes, edges: data.edges, undoStack: [], redoStack: [] });
        saveToStorage(data.nodes, data.edges, history);
      }
    } catch {}
  },

  clearHistory: () => {
    const { nodes, edges } = get();
    set({ history: [] });
    saveToStorage(nodes, edges, []);
  },
}));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      useGraphStore.getState().redo();
    } else {
      useGraphStore.getState().undo();
    }
  }
});
