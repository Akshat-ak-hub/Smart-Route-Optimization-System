import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ambulance, Clock, MapPin, AlertTriangle, Navigation } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { dijkstra } from '@/lib/algorithms';
import { buildAdjacencyList } from '@/lib/graph';
import { TRAFFIC_MULTIPLIER } from '@/types';
import { resolveSampleData } from '@/lib/sampleData';

export default function EmergencyRouting() {
  const store = useGraphStore();
  const [hospital, setHospital] = useState('');
  const [patient, setPatient] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFindEmergencyRoute = () => {
    if (!hospital || !patient) return;
    const adj = buildAdjacencyList(store.nodes, store.edges, TRAFFIC_MULTIPLIER);
    const res = dijkstra(store.nodes, adj, hospital, patient);
    if (res.path.length > 0) {
      let maxTraffic: string = 'normal';
      for (let i = 0; i < res.path.length - 1; i++) {
        const edge = store.edges.find(
          (e) =>
            (e.source === res.path[i] && e.target === res.path[i + 1]) ||
            (e.target === res.path[i] && e.source === res.path[i + 1])
        );
        if (edge) {
          const levels = ['blocked', 'heavy', 'moderate', 'normal'];
          if (levels.indexOf(edge.traffic) < levels.indexOf(maxTraffic)) {
            maxTraffic = edge.traffic;
          }
        }
      }
      const speed = maxTraffic === 'heavy' ? 20 : maxTraffic === 'moderate' ? 30 : 40;
      const time = res.distance / speed * 60;
      setResult({ ...res, estimatedMinutes: time, trafficLevel: maxTraffic, speed });
    } else {
      setResult({ ...res, estimatedMinutes: 0, trafficLevel: 'blocked', speed: 0 });
    }
  };

  const handleLoadEmergencyData = () => {
    const data = resolveSampleData('ambulance');
    if (data) store.loadSampleData(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emergency Routing</h1>
          <p className="text-surface-400 text-sm mt-1">Fastest emergency response routes</p>
        </div>
        <button onClick={handleLoadEmergencyData}
          className="bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
          <Ambulance className="w-4 h-4" /> Load Ambulance Network
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /> Hospital</h3>
          <select value={hospital} onChange={(e) => setHospital(e.target.value)}
            className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
            <option value="">Select hospital</option>
            {store.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Patient Location</h3>
          <select value={patient} onChange={(e) => setPatient(e.target.value)}
            className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
            <option value="">Select patient</option>
            {store.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleFindEmergencyRoute} disabled={!hospital || !patient}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <Ambulance className="w-5 h-5" /> Dispatch Emergency
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-surface-400 text-xs">Estimated Arrival</p>
                <p className="text-xl font-bold text-red-400">{result.estimatedMinutes.toFixed(0)} min</p>
              </div>
            </div>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <p className="text-surface-400 text-xs">Distance</p>
            <p className="text-xl font-bold">{result.distance.toFixed(1)} km</p>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <p className="text-surface-400 text-xs">Traffic Level</p>
            <p className="text-xl font-bold capitalize">{result.trafficLevel}</p>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <p className="text-surface-400 text-xs">Avg Speed</p>
            <p className="text-xl font-bold">{result.speed} km/h</p>
          </div>
          <div className="lg:col-span-4 bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-green-400" /> Emergency Path</h3>
            {result.path.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {result.path.map((id: string) => {
                  const n = store.nodes.find((node) => node.id === id);
                  return <span key={id} className="bg-red-600/20 text-red-300 px-3 py-1 rounded-lg text-sm font-medium">{n?.name ?? id}</span>;
                })}
              </div>
            ) : (
              <p className="text-red-400">No reachable path! Some roads may be blocked.</p>
            )}
          </div>
        </motion.div>
      )}

      {!result && (
        <div className="bg-surface-800 rounded-xl p-8 border border-surface-700 text-center">
          <Ambulance className="w-16 h-16 mx-auto mb-4 text-surface-600" />
          <p className="text-surface-400">Select a hospital and patient location, then dispatch.</p>
          <p className="text-surface-500 text-sm mt-2">Traffic conditions are automatically considered.</p>
        </div>
      )}
    </div>
  );
}
