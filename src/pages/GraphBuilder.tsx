import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node as RFNode,
  Edge as RFEdge,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeProps,
  EdgeProps,
  Handle,
  Position,
  MarkerType,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, Download, RotateCcw, RotateCw, Undo2, Redo2 } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import { resolveSampleData } from '@/lib/sampleData';
import { TRAFFIC_COLORS, TrafficLevel } from '@/types';
import { clsx } from 'clsx';

function CustomNode({ data }: NodeProps) {
  return (
    <div className="bg-surface-800 border-2 border-primary-500 rounded-xl px-4 py-2 shadow-lg min-w-[120px] text-center">
      <Handle type="target" position={Position.Top} />
      <p className="font-semibold text-sm">{data.label}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export default function GraphBuilder() {
  const store = useGraphStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeName, setNodeName] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeDist, setEdgeDist] = useState('');

  const syncToFlow = useCallback(() => {
    const flowNodes: RFNode[] = store.nodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: { x: n.x, y: n.y },
      data: { label: n.name },
    }));
    const flowEdges: RFEdge[] = store.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: `${e.distance}km`,
      style: { stroke: TRAFFIC_COLORS[e.traffic], strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: TRAFFIC_COLORS[e.traffic] },
    }));
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [store.nodes, store.edges, setNodes, setEdges]);

  const syncToStore = useCallback(() => {
    const flowNodes = nodes.map((n) => ({
      id: n.id,
      name: n.data.label,
      x: n.position.x,
      y: n.position.y,
    }));
    const flowEdges = edges.map((e) => {
      const existing = store.edges.find((ed) => ed.id === e.id);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        distance: existing?.distance ?? parseInt(e.label as string) ?? 1,
        traffic: existing?.traffic ?? 'normal' as TrafficLevel,
      };
    });
    useGraphStore.setState({ nodes: flowNodes, edges: flowEdges });
  }, [nodes, edges, store.edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        store.addEdge(connection.source, connection.target, 10);
        syncToFlow();
      }
    },
    [store, syncToFlow]
  );

  const handleAddNode = () => {
    if (!nodeName.trim()) return;
    const pos = reactFlowInstance?.screenToFlowPosition({ x: 300, y: 200 }) || { x: 250, y: 250 };
    store.addNode(nodeName, pos.x, pos.y);
    setNodeName('');
    syncToFlow();
  };

  const handleAddEdge = () => {
    if (!edgeSource || !edgeTarget || !edgeDist) return;
    const srcNode = store.nodes.find((n) => n.name === edgeSource);
    const tgtNode = store.nodes.find((n) => n.name === edgeTarget);
    if (srcNode && tgtNode) {
      store.addEdge(srcNode.id, tgtNode.id, parseFloat(edgeDist));
      syncToFlow();
    }
    setEdgeDist('');
  };

  const handleDeleteNode = (id: string) => {
    store.removeNode(id);
    syncToFlow();
  };

  const handleDeleteEdge = (id: string) => {
    store.removeEdge(id);
    syncToFlow();
  };

  const handleLoadSample = (key: string) => {
    const data = resolveSampleData(key);
    if (data) {
      store.loadSampleData(data);
      syncToFlow();
    }
  };

  const handleExport = () => {
    const json = store.exportGraph();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route-graph.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          store.importGraph(ev.target?.result as string);
          syncToFlow();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        store.addNode('New Location', position.x, position.y);
        syncToFlow();
      }
    },
    [reactFlowInstance, store, syncToFlow]
  );

  // Initial sync
  useState(() => syncToFlow());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Builder</h1>
          <p className="text-surface-400 text-sm mt-1">Build your road network interactively</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { store.undo(); syncToFlow(); }} className="p-2 hover:bg-surface-700 rounded-lg transition-colors" title="Undo">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={() => { store.redo(); syncToFlow(); }} className="p-2 hover:bg-surface-700 rounded-lg transition-colors" title="Redo">
            <Redo2 className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="p-2 hover:bg-surface-700 rounded-lg transition-colors" title="Export JSON">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleImport} className="p-2 hover:bg-surface-700 rounded-lg transition-colors" title="Import JSON">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-surface-800 rounded-xl border border-surface-700 overflow-hidden" style={{ height: '60vh' }}>
          <ReactFlow
            ref={reactFlowWrapper}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeDragStop={syncToStore}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            className="bg-surface-900"
          >
            <Controls className="bg-surface-800 border-surface-700" />
            <Background gap={20} color="#1e293b" />
            <MiniMap
              nodeColor="#6366f1"
              maskColor="rgba(15,23,42,0.8)"
              className="bg-surface-800 border-surface-700"
            />
          </ReactFlow>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Node</h3>
            <input
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
              placeholder="Location name"
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-500"
            />
            <button onClick={handleAddNode} className="w-full bg-primary-600 hover:bg-primary-700 rounded-lg py-2 text-sm font-medium transition-colors">
              Add Node
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold text-sm mb-3">Add Edge</h3>
            <select
              value={edgeSource}
              onChange={(e) => setEdgeSource(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-500"
            >
              <option value="">Source</option>
              {store.nodes.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
            </select>
            <select
              value={edgeTarget}
              onChange={(e) => setEdgeTarget(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-500"
            >
              <option value="">Destination</option>
              {store.nodes.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
            </select>
            <input
              value={edgeDist}
              onChange={(e) => setEdgeDist(e.target.value)}
              placeholder="Distance (km)"
              type="number"
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-primary-500"
            />
            <button onClick={handleAddEdge} className="w-full bg-primary-600 hover:bg-primary-700 rounded-lg py-2 text-sm font-medium transition-colors">
              Add Edge
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-surface-800 rounded-xl p-4 border border-surface-700">
            <h3 className="font-semibold text-sm mb-3">Sample Data</h3>
            <div className="space-y-2">
              {Object.entries({
                chandigarh: 'Chandigarh Network',
                campus: 'University Campus',
                ambulance: 'Ambulance Network',
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleLoadSample(key)}
                  className="w-full bg-surface-900 hover:bg-surface-700 rounded-lg py-2 text-sm transition-colors border border-surface-600"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {store.nodes.length > 0 && (
            <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
              <h3 className="font-semibold text-sm mb-3">Nodes ({store.nodes.length})</h3>
              <div className="space-y-1 max-h-32 overflow-auto">
                {store.nodes.map((n) => (
                  <div key={n.id} className="flex items-center justify-between text-sm bg-surface-900 rounded px-2 py-1">
                    <span>{n.name}</span>
                    <button onClick={() => handleDeleteNode(n.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {store.edges.length > 0 && (
            <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
              <h3 className="font-semibold text-sm mb-3">Edges ({store.edges.length})</h3>
              <div className="space-y-1 max-h-32 overflow-auto">
                {store.edges.map((e) => {
                  const s = store.nodes.find((n) => n.id === e.source);
                  const t = store.nodes.find((n) => n.id === e.target);
                  return (
                    <div key={e.id} className="flex items-center justify-between text-sm bg-surface-900 rounded px-2 py-1">
                      <span className="text-xs">{s?.name}→{t?.name} ({e.distance}km)</span>
                      <button onClick={() => handleDeleteEdge(e.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
