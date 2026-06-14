import { AlgorithmResult } from '@/types';

export function astar(
  nodes: { id: string; name: string; x: number; y: number }[],
  adj: Record<string, { node: string; distance: number }[]>,
  source: string,
  destination: string
): AlgorithmResult {
  const start = performance.now();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const destNode = nodeMap.get(destination);

  function heuristic(id: string): number {
    const n = nodeMap.get(id);
    if (!n || !destNode) return 0;
    const dx = n.x - destNode.x;
    const dy = n.y - destNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const gScore: Record<string, number> = { [source]: 0 };
  const fScore: Record<string, number> = { [source]: heuristic(source) };
  const prev: Record<string, string | null> = {};
  const openSet = new Set<string>([source]);
  const closedSet = new Set<string>();
  const visited: string[] = [];

  while (openSet.size > 0) {
    let current: string | null = null;
    let minF = Infinity;
    for (const id of openSet) {
      if ((fScore[id] ?? Infinity) < minF) {
        minF = fScore[id];
        current = id;
      }
    }
    if (!current) break;

    if (current === destination) {
      const path: string[] = [];
      let c: string | null = destination;
      while (c !== null) {
        path.unshift(c);
        c = prev[c] ?? null;
      }
      const end = performance.now();
      return {
        path: path[0] === source ? path : [],
        distance: gScore[destination] ?? 0,
        visitedNodes: visited,
        executionTime: end - start,
      };
    }

    openSet.delete(current);
    closedSet.add(current);
    visited.push(current);

    for (const neighbor of adj[current] ?? []) {
      if (closedSet.has(neighbor.node)) continue;
      const tentativeG = (gScore[current] ?? 0) + neighbor.distance;
      if (tentativeG < (gScore[neighbor.node] ?? Infinity)) {
        prev[neighbor.node] = current;
        gScore[neighbor.node] = tentativeG;
        fScore[neighbor.node] = tentativeG + heuristic(neighbor.node);
        openSet.add(neighbor.node);
      }
    }
  }

  const end = performance.now();
  return {
    path: [],
    distance: 0,
    visitedNodes: visited,
    executionTime: end - start,
  };
}
