import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, Activity, GitBranch, Navigation } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { TRAFFIC_COLORS } from '@/types';

export default function Analytics() {
  const { nodes, edges, history } = useGraphStore();

  const avgPathLength = history.length > 0
    ? history.reduce((s, h) => s + h.distance, 0) / history.length
    : 0;

  const degreeCount: Record<string, number> = {};
  for (const e of edges) {
    degreeCount[e.source] = (degreeCount[e.source] ?? 0) + 1;
    degreeCount[e.target] = (degreeCount[e.target] ?? 0) + 1;
  }
  let mostConnected = '';
  let maxDegree = 0;
  for (const [id, deg] of Object.entries(degreeCount)) {
    if (deg > maxDegree) { maxDegree = deg; mostConnected = id; }
  }
  const mostConnectedNode = nodes.find((n) => n.id === mostConnected);

  const trafficCount = { normal: 0, moderate: 0, heavy: 0, blocked: 0 };
  for (const e of edges) { trafficCount[e.traffic]++; }

  const trafficData = Object.entries(trafficCount)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: TRAFFIC_COLORS[k as keyof typeof TRAFFIC_COLORS] }));

  const historyChart = history.slice(0, 20).reverse().map((h) => ({
    name: `${nodes.find((n) => n.id === h.source)?.name ?? ''}→${nodes.find((n) => n.id === h.destination)?.name ?? ''}`,
    distance: parseFloat(h.distance.toFixed(1)),
  }));

  const algoCount: Record<string, number> = {};
  for (const h of history) {
    algoCount[h.algorithm] = (algoCount[h.algorithm] ?? 0) + 1;
  }
  const algoData = Object.entries(algoCount).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    count: v,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-surface-400 text-sm mt-1">Graph and route performance analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Nodes', value: nodes.length, icon: Navigation, color: 'from-blue-500' },
          { label: 'Total Roads', value: edges.length, icon: GitBranch, color: 'from-green-500' },
          { label: 'Avg Path Length', value: `${avgPathLength.toFixed(1)} km`, icon: Activity, color: 'from-purple-500' },
          { label: 'Most Connected', value: mostConnectedNode?.name ?? 'N/A', icon: BarChart3, color: 'from-orange-500' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} to-surface-800 flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-surface-400 text-xs">{stat.label}</p>
                <p className="font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-xl p-4 border border-surface-700">
          <h3 className="font-semibold mb-4">Traffic Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={trafficData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {trafficData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-xl p-4 border border-surface-700">
          <h3 className="font-semibold mb-4">Algorithm Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={algoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {history.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold mb-4">Route History (Distance)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="distance" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
          <div className="p-4 border-b border-surface-700 flex items-center justify-between">
            <h3 className="font-semibold">Route History</h3>
            <span className="text-xs text-surface-400">{history.length} entries</span>
          </div>
          <div className="max-h-60 overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700 text-xs text-surface-400">
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Destination</th>
                  <th className="text-left p-3">Algorithm</th>
                  <th className="text-left p-3">Distance</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-surface-700/50 text-sm">
                    <td className="p-3">{nodes.find((n) => n.id === h.source)?.name ?? h.source}</td>
                    <td className="p-3">{nodes.find((n) => n.id === h.destination)?.name ?? h.destination}</td>
                    <td className="p-3 capitalize">{h.algorithm}</td>
                    <td className="p-3">{h.distance.toFixed(1)} km</td>
                    <td className="p-3 text-surface-400">{new Date(h.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {!nodes.length && (
        <div className="bg-surface-800 rounded-xl p-8 border border-surface-700 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-surface-600" />
          <p className="text-surface-400">No data yet. Build a graph and run some routes to see analytics.</p>
        </div>
      )}
    </div>
  );
}
