export function getEffectiveDistance(distance: number, multiplier: number): number {
  return distance * multiplier;
}

export function buildAdjacencyList(
  nodes: { id: string; name: string }[],
  edges: { source: string; target: string; distance: number; traffic: string }[],
  trafficMultiplier: Record<string, number>
): Record<string, { node: string; distance: number }[]> {
  const adj: Record<string, { node: string; distance: number }[]> = {};
  for (const n of nodes) {
    adj[n.id] = [];
  }
  for (const e of edges) {
    const mul = trafficMultiplier[e.traffic] ?? 1;
    const dist = e.distance * mul;
    if (dist !== Infinity) {
      adj[e.source].push({ node: e.target, distance: dist });
      adj[e.target].push({ node: e.source, distance: dist });
    }
  }
  return adj;
}

export function getNodeById(nodes: { id: string; name: string }[], id: string) {
  return nodes.find((n) => n.id === id);
}
