import { GraphNode, GraphEdge } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const id = () => uuidv4();

export const SAMPLE_DATASETS: Record<string, { name: string; description: string; nodes: GraphNode[]; edges: GraphEdge[] }> = {
  chandigarh: {
    name: 'Chandigarh Road Network',
    description: 'Major roads connecting Chandigarh, Mohali, Panchkula, and nearby cities',
    nodes: [
      { id: id(), name: 'Chandigarh', x: 400, y: 200 },
      { id: id(), name: 'Mohali', x: 250, y: 300 },
      { id: id(), name: 'Panchkula', x: 550, y: 250 },
      { id: id(), name: 'Zirakpur', x: 300, y: 400 },
      { id: id(), name: 'Kharar', x: 150, y: 200 },
      { id: id(), name: 'Dera Bassi', x: 200, y: 500 },
      { id: id(), name: 'Ambala', x: 600, y: 400 },
      { id: id(), name: 'Patiala', x: 100, y: 450 },
    ],
    edges: [
      { id: id(), source: '', target: '', distance: 12, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 8, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 15, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 10, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 20, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 18, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 25, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 14, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 30, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 22, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 35, traffic: 'normal' },
    ],
  },
  campus: {
    name: 'University Campus Navigation',
    description: 'Walking paths across a university campus',
    nodes: [
      { id: id(), name: 'Main Gate', x: 300, y: 500 },
      { id: id(), name: 'Admin Block', x: 400, y: 400 },
      { id: id(), name: 'Library', x: 500, y: 300 },
      { id: id(), name: 'Science Block', x: 300, y: 250 },
      { id: id(), name: 'Cafeteria', x: 450, y: 500 },
      { id: id(), name: 'Hostel', x: 200, y: 350 },
      { id: id(), name: 'Sports Complex', x: 550, y: 450 },
      { id: id(), name: 'Auditorium', x: 400, y: 150 },
    ],
    edges: [
      { id: id(), source: '', target: '', distance: 5, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 8, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 6, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 10, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 4, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 7, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 12, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 3, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 9, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 6, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 15, traffic: 'normal' },
    ],
  },
  ambulance: {
    name: 'Ambulance Routing Network',
    description: 'Emergency vehicle routing with hospitals and patient locations',
    nodes: [
      { id: id(), name: 'City Hospital', x: 350, y: 150 },
      { id: id(), name: 'Apollo Hospital', x: 550, y: 100 },
      { id: id(), name: 'Patient A', x: 200, y: 300 },
      { id: id(), name: 'Patient B', x: 450, y: 400 },
      { id: id(), name: 'Patient C', x: 600, y: 350 },
      { id: id(), name: 'Traffic Junction', x: 300, y: 200 },
      { id: id(), name: 'Highway', x: 500, y: 250 },
      { id: id(), name: 'Ambulance Depot', x: 100, y: 100 },
    ],
    edges: [
      { id: id(), source: '', target: '', distance: 8, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 12, traffic: 'heavy' },
      { id: id(), source: '', target: '', distance: 5, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 15, traffic: 'moderate' },
      { id: id(), source: '', target: '', distance: 10, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 7, traffic: 'heavy' },
      { id: id(), source: '', target: '', distance: 20, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 6, traffic: 'moderate' },
      { id: id(), source: '', target: '', distance: 3, traffic: 'blocked' },
      { id: id(), source: '', target: '', distance: 18, traffic: 'normal' },
      { id: id(), source: '', target: '', distance: 9, traffic: 'moderate' },
    ],
  },
};

export function resolveSampleData(key: string) {
  const ds = SAMPLE_DATASETS[key];
  if (!ds) return null;

  const nodeIds = ds.nodes.map((n) => n.id);
  // assign edges properly - pair consecutive nodes
  const resolvedEdges: GraphEdge[] = [];
  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [5, 6], [6, 7], [0, 3], [1, 4], [2, 5],
    [0, 7], [3, 6],
  ];

  ds.edges.forEach((e, idx) => {
    const pair = pairs[idx % pairs.length];
    if (pair && nodeIds[pair[0]] && nodeIds[pair[1]]) {
      resolvedEdges.push({
        ...e,
        source: nodeIds[pair[0]],
        target: nodeIds[pair[1]],
      });
    }
  });

  return { nodes: ds.nodes, edges: resolvedEdges };
}
