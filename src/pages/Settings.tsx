import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Upload, Download, Check } from 'lucide-react';
import { useGraphStore } from '@/lib/store';

export default function Settings() {
  const store = useGraphStore();
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const json = store.exportGraph();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (importText.trim()) {
      store.importGraph(importText);
      setImportText('');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure? This will delete all nodes, edges, and history.')) {
      store.clearGraph();
      store.clearHistory();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-surface-400 text-sm mt-1">Manage graph data and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-xl p-5 border border-surface-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Download className="w-4 h-4" /> Export Graph</h3>
          <p className="text-sm text-surface-400 mb-4">Copy your graph data as JSON or download as a file.</p>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button onClick={() => {
              const blob = new Blob([store.exportGraph()], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'route-graph.json'; a.click();
              URL.revokeObjectURL(url);
            }}
              className="bg-surface-700 hover:bg-surface-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              Download File
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface-800 rounded-xl p-5 border border-surface-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Upload className="w-4 h-4" /> Import Graph</h3>
          <p className="text-sm text-surface-400 mb-4">Paste JSON data to import a graph.</p>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
            placeholder='{"nodes": [...], "edges": [...]}' rows={3}
            className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary-500 font-mono" />
          <button onClick={handleImport} disabled={!importText.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            Import
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface-800 rounded-xl p-5 border border-surface-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">Reset</h3>
          <p className="text-sm text-surface-400 mb-4">Clear all graph data and route history.</p>
          <button onClick={handleClearAll}
            className="bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Clear All Data
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface-800 rounded-xl p-5 border border-surface-700">
          <h3 className="font-semibold mb-4">Data Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-surface-400">Nodes</span><span>{store.nodes.length}</span></div>
            <div className="flex justify-between"><span className="text-surface-400">Edges</span><span>{store.edges.length}</span></div>
            <div className="flex justify-between"><span className="text-surface-400">Route History</span><span>{store.history.length}</span></div>
            <div className="flex justify-between"><span className="text-surface-400">Storage</span><span>{(new Blob([store.exportGraph()]).size / 1000).toFixed(1)} KB</span></div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-800 rounded-xl p-5 border border-surface-700">
        <h3 className="font-semibold mb-4">About</h3>
        <div className="text-sm text-surface-400 space-y-1">
          <p><strong>Smart Route Optimization System</strong> v1.0.0</p>
          <p>Built with React, TypeScript, Tailwind CSS, React Flow, Framer Motion, Recharts</p>
          <p>Graph Algorithms: Dijkstra, BFS, DFS, A*</p>
          <p>Data is stored locally in your browser (localStorage).</p>
        </div>
      </motion.div>
    </div>
  );
}
