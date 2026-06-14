import { AlgorithmResult } from '@/types';

export function bfs(
  nodes: { id: string; name: string }[],
  adj: Record<string, { node: string; distance: number }[]>,
  source: string,
  destination: string
): AlgorithmResult {
  const start = performance.now();
  const visited: string[] = [];
  const queue: string[] = [source];
  const prev: Record<string, string | null> = { [source]: null };
  const dist: Record<string, number> = { [source]: 0 };
  const visitedSet = new Set<string>([source]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.push(current);
    if (current === destination) break;

    for (const neighbor of adj[current] ?? []) {
      if (!visitedSet.has(neighbor.node)) {
        visitedSet.add(neighbor.node);
        prev[neighbor.node] = current;
        dist[neighbor.node] = (dist[current] ?? 0) + neighbor.distance;
        queue.push(neighbor.node);
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = destination;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr] ?? null;
  }

  const end = performance.now();
  return {
    path: path[0] === source ? path : [],
    distance: dist[destination] ?? 0,
    visitedNodes: visited,
    executionTime: end - start,
  };
}
