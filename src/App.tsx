import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import GraphBuilder from './pages/GraphBuilder';
import RouteOptimizer from './pages/RouteOptimizer';
import AlgorithmComparison from './pages/AlgorithmComparison';
import Analytics from './pages/Analytics';
import EmergencyRouting from './pages/EmergencyRouting';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/graph-builder" element={<GraphBuilder />} />
        <Route path="/route-optimizer" element={<RouteOptimizer />} />
        <Route path="/comparison" element={<AlgorithmComparison />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/emergency" element={<EmergencyRouting />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
