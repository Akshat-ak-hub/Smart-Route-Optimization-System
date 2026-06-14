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

## How to Use

### 1. Dashboard
The home page shows an overview of your graph — total nodes, roads, algorithms available, and routes found. Quick-access cards let you jump to any feature. Recent route history is displayed at the bottom.

### 2. Graph Builder
Build your road network visually:

- **Add a Node** — Type a location name in the "Add Node" panel and click "Add Node". The node appears on the canvas. You can also drag-drop from nowhere onto the canvas.
- **Add an Edge** — Select a source and destination from the dropdowns, enter a distance in km, and click "Add Edge". You can also click-and-drag between two node handles on the canvas.
- **Delete** — Click the trash icon next to any node or edge in the side panel.
- **Move Nodes** — Drag any node to reposition it on the canvas.
- **Undo/Redo** — Use the undo/redo buttons or keyboard shortcuts (`Ctrl+Z` / `Ctrl+Shift+Z`).
- **Sample Data** — Click one of the pre-built datasets (Chandigarh Road Network, University Campus, Ambulance Network) to load a ready-made graph.
- **Import/Export** — Download your graph as JSON or upload a previously saved graph.

### 3. Route Optimizer
Find the shortest path between two locations:

- Select a **Source** and **Destination** from the dropdown menus.
- Choose an **Algorithm** (Dijkstra, BFS, DFS, or A*).
- Click **"Find Route"** — the system animates the traversal, highlighting visited nodes in purple and the final shortest path in green.
- The result panel shows total distance, visited nodes count, execution time, and the complete path.

### 4. Traffic Simulation
Each road (edge) has a traffic condition that affects route calculations:

- **Normal** — Distance × 1 (green)
- **Moderate** — Distance × 1.5 (yellow)
- **Heavy** — Distance × 2.5 (red)
- **Blocked** — Distance = ∞ (gray, impassable)

To change traffic: edit the edge in Graph Builder (traffic level is read from the edge data). Routes automatically account for traffic when computing optimal paths.

### 5. Algorithm Comparison
Benchmark all four algorithms side by side:

- Select a source and destination, then click **"Compare All"**.
- A table shows each algorithm's distance, visited nodes, execution time, and whether a path was found.
- A bar chart visualizes the differences.
- Detailed paths for each algorithm are displayed below.

### 6. Analytics Dashboard
View statistics about your graph and routing history:

- **Key Metrics** — Total nodes, roads, average path length, most connected node.
- **Traffic Distribution** — Pie chart showing how many roads are at each traffic level.
- **Algorithm Usage** — Bar chart of which algorithms you've used most.
- **Route History** — Line chart of route distances over time, plus a full history table.

### 7. Emergency Routing
Simulate ambulance dispatch:

- Click **"Load Ambulance Network"** to load the emergency sample dataset.
- Select a **Hospital** and a **Patient Location**.
- Click **"Dispatch Emergency"** — the system calculates the fastest route considering traffic.
- Results show estimated arrival time, distance, traffic level, average speed, and the full path.

### 8. Settings
Manage your data:

- **Export** — Copy graph JSON to clipboard or download as a file.
- **Import** — Paste JSON to restore a previously saved graph.
- **Reset** — Clear all graph data and route history.
- **Data Summary** — See node/edge counts and storage size.

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
