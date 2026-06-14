import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Map, GitCompare, Ambulance, BarChart3, Navigation, HelpCircle, ChevronDown } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

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

const guideSteps = [
  {
    step: 1,
    title: 'Build Your Road Network',
    page: 'Graph Builder',
    to: '/graph-builder',
    icon: Map,
    instructions: [
      'Add locations (nodes) by typing a name and clicking "Add Node".',
      'Connect them with roads (edges) by selecting source, destination, and distance.',
      'Click and drag between node handles on the canvas to connect visually.',
      'Click "Load Sample Data" to instantly load the Chandigarh road network.',
      'Drag nodes to reposition them — the graph auto-saves to your browser.',
    ],
  },
  {
    step: 2,
    title: 'Simulate Traffic Conditions',
    page: 'Graph Builder',
    to: '/graph-builder',
    icon: Navigation,
    instructions: [
      'Each road has a traffic level: Normal (green), Moderate (yellow), Heavy (red), or Blocked (gray).',
      'Traffic multiplies the effective distance: Normal ×1, Moderate ×1.5, Heavy ×2.5, Blocked = ∞.',
      'Heavy traffic roads appear thicker in red — the route optimizer accounts for these weights.',
    ],
  },
  {
    step: 3,
    title: 'Find Optimal Routes',
    page: 'Route Optimizer',
    to: '/route-optimizer',
    icon: Route,
    instructions: [
      'Select a source and destination from your graph nodes.',
      'Choose an algorithm: Dijkstra (best for weighted roads), BFS (minimum hops), DFS (path existence), or A* (fast heuristic).',
      'Click "Find Route" — the visualization animates the algorithm step by step.',
      'Visited nodes turn purple, and the final shortest path glows green.',
      'View total distance, visited count, execution time, and the full path.',
    ],
  },
  {
    step: 4,
    title: 'Compare Algorithms Side by Side',
    page: 'Algorithm Comparison',
    to: '/comparison',
    icon: GitCompare,
    instructions: [
      'Select the same source and destination, then click "Compare All".',
      'A table shows Dijkstra, BFS, DFS, and A* results: distance, visited nodes, time.',
      'Bar charts visualize the performance differences at a glance.',
      'Each algorithm\'s complete path is displayed for direct comparison.',
      'Ideal for understanding which algorithm performs best on your graph.',
    ],
  },
  {
    step: 5,
    title: 'Analyze Your Graph Data',
    page: 'Analytics',
    to: '/analytics',
    icon: BarChart3,
    instructions: [
      'View total nodes, roads, average path length, and the most connected node.',
      'Pie chart shows traffic distribution across your road network.',
      'Bar chart tracks which algorithms you\'ve used most frequently.',
      'Route history line chart shows distance trends over time.',
      'Full history table lets you review every route you\'ve computed.',
    ],
  },
  {
    step: 6,
    title: 'Dispatch Emergency Vehicles',
    page: 'Emergency Routing',
    to: '/emergency',
    icon: Ambulance,
    instructions: [
      'Click "Load Ambulance Network" to load the emergency scenario dataset.',
      'Select a hospital and a patient location from the graph nodes.',
      'Click "Dispatch Emergency" — the system finds the fastest route considering traffic.',
      'Results show estimated arrival time, distance, traffic level, and average speed.',
      'This simulates real-world ambulance dispatch with dynamic road conditions.',
    ],
  },
];

export default function Dashboard() {
  const { nodes, edges, history } = useGraphStore();
  const [guideOpen, setGuideOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

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

      {/* Quick Start Guide */}
      <div className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold">Quick Start Guide</h2>
          </div>
          <ChevronDown className={clsx('w-4 h-4 transition-transform', guideOpen && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-surface-700"
            >
              <div className="p-4 space-y-3">
                {guideSteps.map((step) => (
                  <div key={step.step} className="bg-surface-900 rounded-lg border border-surface-700 overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-surface-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {step.step}
                      </div>
                      <step.icon className="w-4 h-4 text-surface-400 shrink-0" />
                      <span className="text-sm font-medium text-left">{step.title}</span>
                      <span className="text-xs text-surface-500 ml-auto">in {step.page}</span>
                      <ChevronDown className={clsx('w-3 h-3 text-surface-500 transition-transform', expandedStep === step.step && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {expandedStep === step.step && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-surface-700"
                        >
                          <div className="p-3 space-y-1.5">
                            {step.instructions.map((instr, i) => (
                              <p key={i} className="text-xs text-surface-400 flex gap-2">
                                <span className="text-primary-500 shrink-0">•</span>
                                <span>{instr}</span>
                              </p>
                            ))}
                            <Link
                              to={step.to}
                              className="inline-block mt-2 text-xs text-primary-400 hover:text-primary-300 font-medium"
                            >
                              Go to {step.page} →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
