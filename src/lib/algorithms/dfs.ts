import { AlgorithmResult } from '@/types';

export function dfs(
  nodes: { id: string; name: string }[],
  adj: Record<string, { node: string; distance: number }[]>,
  source: string,
  destination: string
): AlgorithmResult {
  const start = performance.now();
  const visited: string[] = [];
  const visitedSet = new Set<string>();
  const prev: Record<string, string | null> = {};
  const dist: Record<string, number> = {};
  let found = false;

  function traverse(current: string, parent: string | null, currentDist: number) {
    if (found) return;
    visitedSet.add(current);
    visited.push(current);
    prev[current] = parent;
    dist[current] = currentDist;

    if (current === destination) {
      found = true;
      return;
    }

    for (const neighbor of adj[current] ?? []) {
      if (!visitedSet.has(neighbor.node)) {
        traverse(neighbor.node, current, currentDist + neighbor.distance);
      }
    }
  }

  traverse(source, null, 0);

  const path: string[] = [];
  let curr: string | null = destination;
  while (curr !== null && prev[curr] !== undefined) {
    path.unshift(curr);
    curr = prev[curr];
  }
  if (curr === source) path.unshift(source);

  const end = performance.now();
  return {
    path: path[0] === source ? path : [],
    distance: dist[destination] ?? 0,
    visitedNodes: visited,
    executionTime: end - start,
  };
}
