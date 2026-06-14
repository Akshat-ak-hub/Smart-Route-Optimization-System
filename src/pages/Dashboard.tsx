import { motion } from 'framer-motion';
import { Route, Map, GitCompare, Ambulance, BarChart3, Navigation } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Nodes', key: 'nodes', icon: Map, color: 'from-blue-500 to-blue-600' },
  { label: 'Total Roads', key: 'edges', icon: Navigation, color: 'from-green-500 to-green-600' },
  { label: 'Algorithms', key: null, value: '4', icon: GitCompare, color: 'from-purple-500 to-purple-600' },
  { label: 'Routes Found', key: 'history', icon: BarChart3, color: 'from-orange-500 to-orange-600' },
];

const features = [
  { title: 'Graph Builder', desc: 'Create nodes and edges interactively', icon: Map, to: '/graph-builder' },
  { title: 'Route Optimizer', desc: 'Find shortest paths with 4 algorithms', icon: Route, to: '/route-optimizer' },
  { title: 'Algorithm Comparison', desc: 'Compare Dijkstra, BFS, DFS, A*', icon: GitCompare, to: '/comparison' },
  { title: 'Emergency Routing', desc: 'Ambulance dispatch simulation', icon: Ambulance, to: '/emergency' },
];

export default function Dashboard() {
  const { nodes, edges, history } = useGraphStore();

  const cards = [
    { ...stats[0], value: nodes.length },
    { ...stats[1], value: edges.length },
    { ...stats[2], value: '4' },
    { ...stats[3], value: history.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Smart Route Optimization System</h1>
        <p className="text-surface-400 mt-1">Graph-based route planning with real-time traffic simulation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-800 rounded-xl p-4 border border-surface-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-surface-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feat) => (
          <Link key={feat.to} to={feat.to}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-surface-800 rounded-xl p-5 border border-surface-700 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <feat.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{feat.title}</h3>
                  <p className="text-surface-400 text-sm">{feat.desc}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {history.length > 0 && (
        <div className="bg-surface-800 rounded-xl p-5 border border-surface-700">
          <h2 className="font-semibold mb-3">Recent Routes</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm bg-surface-900 rounded-lg p-3">
                <span className="text-surface-300">
                  {h.source} → {h.destination}
                </span>
                <span className="text-surface-400">{h.distance.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
