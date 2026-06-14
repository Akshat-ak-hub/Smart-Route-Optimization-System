import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GitCompare, Play } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { AlgorithmType, ALGORITHM_NAMES } from '@/types';

export default function AlgorithmComparison() {
  const store = useGraphStore();
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [results, setResults] = useState<Record<string, any> | null>(null);

  const handleCompare = () => {
    if (!source || !dest) return;
    const res = store.compareAlgorithms(source, dest);
    setResults(res);
  };

  const chartData = results
    ? Object.entries(results)
        .filter(([_, r]) => r.path.length > 0)
        .map(([key, r]) => ({
          name: key.toUpperCase(),
          Distance: parseFloat(r.distance.toFixed(1)),
          'Visited Nodes': r.visitedNodes.length,
          'Time (ms)': parseFloat(r.executionTime.toFixed(2)),
        }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Algorithm Comparison</h1>
        <p className="text-surface-400 text-sm mt-1">Compare Dijkstra, BFS, DFS, and A* side by side</p>
      </div>

      <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}
              className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
              <option value="">Select source</option>
              {store.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Destination</label>
            <select value={dest} onChange={(e) => setDest(e.target.value)}
              className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
              <option value="">Select destination</option>
              {store.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <button onClick={handleCompare}
            className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" /> Compare All
          </button>
        </div>
      </div>

      {results && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="text-left p-4 text-sm font-semibold text-surface-300">Algorithm</th>
                  <th className="text-left p-4 text-sm font-semibold text-surface-300">Distance</th>
                  <th className="text-left p-4 text-sm font-semibold text-surface-300">Visited Nodes</th>
                  <th className="text-left p-4 text-sm font-semibold text-surface-300">Time (ms)</th>
                  <th className="text-left p-4 text-sm font-semibold text-surface-300">Path Found</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(results) as [AlgorithmType, any][]).map(([key, r]) => (
                  <tr key={key} className="border-b border-surface-700/50 hover:bg-surface-700/30">
                    <td className="p-4 text-sm font-medium">{ALGORITHM_NAMES[key]}</td>
                    <td className="p-4 text-sm">{r.path.length > 0 ? `${r.distance.toFixed(1)} km` : '—'}</td>
                    <td className="p-4 text-sm">{r.visitedNodes.length}</td>
                    <td className="p-4 text-sm">{r.executionTime.toFixed(2)}</td>
                    <td className="p-4 text-sm">
                      {r.path.length > 0
                        ? <span className="text-green-400">Yes</span>
                        : <span className="text-red-400">No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold mb-4">Visual Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Distance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Visited Nodes" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Time (ms)" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Path details per algorithm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(results) as [AlgorithmType, any][]).map(([key, r]) => (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-surface-800 rounded-xl p-4 border border-surface-700">
                <h4 className="font-semibold text-sm mb-2">{ALGORITHM_NAMES[key]}</h4>
                {r.path.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {r.path.map((id: string) => {
                      const n = store.nodes.find((node) => node.id === id);
                      return (
                        <span key={id} className="bg-surface-700 text-surface-300 px-2 py-0.5 rounded text-xs">
                          {n?.name ?? id}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No path found</p>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!results && (
        <div className="bg-surface-800 rounded-xl p-8 border border-surface-700 text-center">
          <GitCompare className="w-12 h-12 mx-auto mb-3 text-surface-600" />
          <p className="text-surface-400">Select source and destination, then click "Compare All"</p>
        </div>
      )}
    </div>
  );
}
