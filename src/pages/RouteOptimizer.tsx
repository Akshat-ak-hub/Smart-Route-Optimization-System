import { useState, useCallback } from 'react';
import ReactFlow, {
  Node as RFNode,
  Edge as RFEdge,
  Controls,
  Background,
  MiniMap,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Search, Route, Play, RefreshCw } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { TRAFFIC_COLORS, ALGORITHM_NAMES } from '@/types';

export default function RouteOptimizer() {
  const store = useGraphStore();
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [result, setResult] = useState<any>(null);
  const [animating, setAnimating] = useState(false);
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [pathSet, setPathSet] = useState<Set<string>>(new Set());

  const flowNodes: RFNode[] = store.nodes.map((n) => ({
    id: n.id,
    type: 'default',
    position: { x: n.x, y: n.y },
    data: {
      label: n.name,
    },
    style: {
      background: visitedSet.has(n.id)
        ? pathSet.has(n.id)
          ? '#22c55e'
          : '#6366f180'
        : '#1e293b',
      border: `2px solid ${pathSet.has(n.id) ? '#22c55e' : visitedSet.has(n.id) ? '#818cf8' : '#334155'}`,
      color: '#fff',
      borderRadius: '12px',
      padding: '8px 16px',
      fontWeight: 600,
      fontSize: '14px',
      transition: 'all 0.3s',
    },
  }));

  const flowEdges: RFEdge[] = store.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: `${e.distance}km`,
    style: {
      stroke: TRAFFIC_COLORS[e.traffic],
      strokeWidth: pathSet.has(e.id) ? 4 : 2,
      transition: 'all 0.3s',
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: TRAFFIC_COLORS[e.traffic] },
  }));

  const handleFindRoute = async () => {
    if (!source || !dest) return;
    setAnimating(true);
    setVisitedSet(new Set());
    setPathSet(new Set());

    const res = store.findRoute(source, dest);
    if (!res) { setAnimating(false); return; }

    // Animate visited nodes
    for (let i = 0; i < res.visitedNodes.length; i++) {
      await new Promise((r) => setTimeout(r, 50));
      setVisitedSet(new Set(res.visitedNodes.slice(0, i + 1)));
    }

    // Animate final path
    await new Promise((r) => setTimeout(r, 300));
    const pathEdgeIds: string[] = [];
    for (let i = 0; i < res.path.length - 1; i++) {
      const edge = store.edges.find(
        (e) =>
          (e.source === res.path[i] && e.target === res.path[i + 1]) ||
          (e.target === res.path[i] && e.source === res.path[i + 1])
      );
      if (edge) pathEdgeIds.push(edge.id);
    }
    setPathSet(new Set(pathEdgeIds));
    setResult(res);
    setAnimating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Route Optimizer</h1>
        <p className="text-surface-400 text-sm mt-1">Find the optimal path between two locations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-surface-800 rounded-xl border border-surface-700 overflow-hidden" style={{ height: '55vh' }}>
          <ReactFlow nodes={flowNodes} edges={flowEdges} fitView className="bg-surface-900">
            <Controls className="bg-surface-800 border-surface-700" />
            <Background gap={20} color="#1e293b" />
            <MiniMap nodeColor="#6366f1" maskColor="rgba(15,23,42,0.8)" className="bg-surface-800 border-surface-700" />
          </ReactFlow>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> Route Settings</h3>

            <label className="text-xs text-surface-400 mb-1 block">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary-500"
            >
              <option value="">Select source</option>
              {store.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>

            <label className="text-xs text-surface-400 mb-1 block">Destination</label>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary-500"
            >
              <option value="">Select destination</option>
              {store.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>

            <label className="text-xs text-surface-400 mb-1 block">Algorithm</label>
            <select
              value={store.selectedAlgorithm}
              onChange={(e) => store.setAlgorithm(e.target.value as any)}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary-500"
            >
              {Object.entries(ALGORITHM_NAMES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>

            <button
              onClick={handleFindRoute}
              disabled={animating || !source || !dest}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {animating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {animating ? 'Computing...' : 'Find Route'}
            </button>
          </motion.div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-800 rounded-xl p-4 border border-surface-700"
            >
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Route className="w-4 h-4 text-green-400" /> Route Found</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Distance</span>
                  <span className="font-bold text-green-400">{result.distance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Visited Nodes</span>
                  <span>{result.visitedNodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Time</span>
                  <span>{(result.executionTime).toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Path</span>
                  <span>{result.path.length > 0 ? `${result.path.length} nodes` : 'No path found'}</span>
                </div>
                {result.path.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.path.map((id: string) => {
                      const n = store.nodes.find((node) => node.id === id);
                      return (
                        <span key={id} className="bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded text-xs">
                          {n?.name ?? id}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!store.nodes.length && (
            <div className="bg-surface-800 rounded-xl p-4 border border-surface-700 text-center text-surface-500 text-sm">
              <Route className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No graph data. Build a graph first or load sample data from the Graph Builder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
