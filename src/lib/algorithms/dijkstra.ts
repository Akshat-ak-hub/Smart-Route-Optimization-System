import { AlgorithmResult } from '@/types';

export function dijkstra(
  nodes: { id: string; name: string }[],
  adj: Record<string, { node: string; distance: number }[]>,
  source: string,
  destination: string
): AlgorithmResult {
  const start = performance.now();
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: string[] = [];
  const unvisited = new Set(nodes.map((n) => n.id));

  for (const n of nodes) {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  }
  dist[source] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      if (dist[id] < minDist) {
        minDist = dist[id];
        current = id;
      }
    }
    if (current === null || dist[current] === Infinity) break;

    unvisited.delete(current);
    visited.push(current);
    if (current === destination) break;

    for (const neighbor of adj[current] ?? []) {
      if (!unvisited.has(neighbor.node)) continue;
      const alt = dist[current] + neighbor.distance;
      if (alt < dist[neighbor.node]) {
        dist[neighbor.node] = alt;
        prev[neighbor.node] = current;
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = destination;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }

  const end = performance.now();
  return {
    path: path[0] === source ? path : [],
    distance: dist[destination] === Infinity ? 0 : dist[destination],
    visitedNodes: visited,
    executionTime: end - start,
  };
}
