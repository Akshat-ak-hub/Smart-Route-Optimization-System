# Smart Route Optimization System

A modern web application for building road networks and finding optimal routes using graph algorithms (Dijkstra, BFS, DFS, A*). Features interactive graph visualization, traffic simulation, algorithm comparison, and emergency routing.

## Features

- **Interactive Graph Builder** — Create nodes and edges visually using React Flow
- **Route Optimization** — Find shortest paths with Dijkstra, BFS, DFS, and A*
- **Traffic Simulation** — Dynamic road weights (normal, moderate, heavy, blocked)
- **Algorithm Comparison** — Side-by-side performance comparison with charts
- **Analytics Dashboard** — Graph statistics, traffic distribution, algorithm usage
- **Emergency Routing** — Hospital-to-patient dispatch with time estimation
- **Sample Datasets** — Pre-built road networks (Chandigarh, University, Ambulance)
- **Import/Export** — Save and load graphs as JSON
- **Undo/Redo** — Full history support (Ctrl+Z / Ctrl+Shift+Z)
- **Dark Theme** — Modern, responsive UI with dark color scheme

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Flow** for graph visualization
- **Framer Motion** for animations
- **Recharts** for charts
- **Zustand** for state management
- **Lucide React** for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Open the app in your browser (default: http://localhost:5173)
2. Go to **Graph Builder** to create nodes and edges
3. Load sample data or build your own road network
4. Go to **Route Optimizer** to find paths between locations
5. Use **Comparison** to benchmark algorithms
6. Check **Analytics** for graph statistics
7. Try **Emergency Routing** for ambulance dispatch simulation

## Algorithms

| Algorithm | Type | Use Case |
|-----------|------|----------|
| Dijkstra | Weighted graph | Shortest path (distance-aware) |
| BFS | Unweighted graph | Minimum hops |
| DFS | Depth-first | Path existence |
| A* | Heuristic search | Fast weighted pathfinding |

## Project Structure

```
src/
├── components/layout/   # Sidebar, Layout
├── lib/
│   ├── algorithms/       # Dijkstra, BFS, DFS, A*
│   ├── graph.ts          # Graph utilities
│   ├── sampleData.ts     # Sample datasets
│   └── store.ts          # Zustand store (state management)
├── pages/                # Dashboard, GraphBuilder, RouteOptimizer,
│                         # AlgorithmComparison, Analytics,
│                         # EmergencyRouting, Settings
└── types/                # TypeScript types
```

## License

MIT
