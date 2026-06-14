import { useState, useMemo } from 'react';
import ReactFlow, { Node as RFNode, Edge as RFEdge, Controls, Background, MiniMap, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Ambulance, Clock, MapPin, AlertTriangle, Navigation } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { dijkstra } from '@/lib/algorithms';
import { buildAdjacencyList } from '@/lib/graph';
import { TRAFFIC_MULTIPLIER, TRAFFIC_COLORS } from '@/types';
import { resolveSampleData } from '@/lib/sampleData';

export default function EmergencyRouting() {
  const store = useGraphStore();
  const [hospital, setHospital] = useState('');
  const [patient, setPatient] = useState('');
  const [result, setResult] = useState<any>(null);

  const pathSet = useMemo(() => {
    if (!result || !result.path) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < result.path.length - 1; i++) {
      const edge = store.edges.find(
        (e) =>
          (e.source === result.path[i] && e.target === result.path[i + 1]) ||
          (e.target === result.path[i] && e.source === result.path[i + 1])
      );
      if (edge) set.add(edge.id);
    }
    return set;
  }, [result, store.edges]);

  const flowNodes: RFNode[] = store.nodes.map((n) => ({
    id: n.id,
    type: 'default',
    position: { x: n.x, y: n.y },
    data: { label: n.name },
    style: {
      background: result?.path?.includes(n.id)
        ? n.id === hospital
          ? '#ef4444'
          : n.id === patient
            ? '#eab308'
            : '#22c55e'
        : '#1e293b',
      border: `2px solid ${
        n.id === hospital ? '#ef4444' : n.id === patient ? '#eab308' : result?.path?.includes(n.id) ? '#22c55e' : '#334155'
      }`,
      color: '#fff',
      borderRadius: '12px',
      padding: '8px 16px',
      fontWeight: 600,
      fontSize: '13px',
      transition: 'all 0.3s',
    },
  }));

  const flowEdges: RFEdge[] = store.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: `${e.distance}km`,
    style: {
      stroke: pathSet.has(e.id) ? '#22c55e' : TRAFFIC_COLORS[e.traffic],
      strokeWidth: pathSet.has(e.id) ? 5 : 2,
      opacity: pathSet.has(e.id) ? 1 : 0.6,
      transition: 'all 0.3s',
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: pathSet.has(e.id) ? '#22c55e' : TRAFFIC_COLORS[e.traffic] },
  }));

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

      {/* Graph Visualization */}
      <div className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden" style={{ height: '45vh' }}>
        <ReactFlow nodes={flowNodes} edges={flowEdges} fitView className="bg-surface-900">
          <Controls className="bg-surface-800 border-surface-700" />
          <Background gap={20} color="#1e293b" />
          <MiniMap nodeColor="#6366f1" maskColor="rgba(15,23,42,0.8)" className="bg-surface-800 border-surface-700" />
        </ReactFlow>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-xl font-bold">{result.distance.toFixed(1)}</p>
              <span className="text-surface-400 text-sm">km</span>
            </div>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <p className="text-surface-400 text-xs">Traffic Level</p>
            <p className="text-xl font-bold capitalize">{result.trafficLevel}</p>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <p className="text-surface-400 text-xs">Avg Speed</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-xl font-bold">{result.speed}</p>
              <span className="text-surface-400 text-sm">km/h</span>
            </div>
          </div>
          <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <p className="text-surface-400 text-xs">Nodes Visited</p>
            <p className="text-xl font-bold">{result.visitedNodes.length}</p>
          </div>
          <div className="lg:col-span-5 bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Navigation className="w-4 h-4 text-green-400" /> Emergency Path</h3>
            {result.path.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {result.path.map((id: string, idx: number) => {
                  const n = store.nodes.find((node) => node.id === id);
                  const isHospital = id === hospital;
                  const isPatient = id === patient;
                  return (
                    <span key={id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${
                        isHospital ? 'bg-red-600/20 text-red-300' :
                        isPatient ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-green-600/20 text-green-300'
                      }`}
                    >
                      {isHospital && <Ambulance className="w-3 h-3" />}
                      {isPatient && <MapPin className="w-3 h-3" />}
                      {n?.name ?? id}
                      {idx < result.path.length - 1 && <span className="text-surface-600 mx-0.5">→</span>}
                    </span>
                  );
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
