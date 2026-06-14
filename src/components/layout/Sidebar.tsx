import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Route, Map, GitCompare, BarChart3, Ambulance, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/graph-builder', label: 'Graph Builder', icon: Map },
  { to: '/route-optimizer', label: 'Route Optimizer', icon: Route },
  { to: '/comparison', label: 'Comparison', icon: GitCompare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/emergency', label: 'Emergency', icon: Ambulance },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'bg-surface-900 border-r border-surface-700 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="p-4 border-b border-surface-700 flex items-center gap-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Route className="w-6 h-6 text-primary-400" />
            <span className="font-bold text-sm">RouteOpt</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 hover:bg-surface-700 rounded transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border-r-2 border-primary-500'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-white'
              )
            }
          >
            <link.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-700 text-xs text-surface-500">
        {!collapsed && <span>v1.0.0</span>}
      </div>
    </aside>
  );
}
