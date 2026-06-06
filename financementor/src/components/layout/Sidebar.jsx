import React, { useState } from 'react'
import {
  Map, BookOpen, Calculator, Folder, BarChart2,
  MessageSquare, Target, Brain, Settings, ChevronLeft, ChevronRight,
  TrendingUp, LayoutDashboard, Layers, Table2, FileText, Activity
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'market',       icon: Activity,        label: 'Market Data' },
  { id: 'learning',     icon: Map,             label: 'Learning Path' },
  { id: 'concepts',     icon: BookOpen,        label: 'Concept Library' },
  { id: 'calculators',  icon: Calculator,      label: 'Calculators' },
  { id: 'cases',        icon: Folder,          label: 'Case Studies' },
  { id: 'ratios',       icon: BarChart2,       label: 'Ratio Reference' },
  { id: 'visuals',      icon: Layers,          label: 'Visual Diagrams' },
  { id: 'excel',        icon: Table2,          label: 'Excel Modeling' },
  { id: 'research',     icon: FileText,        label: 'Research Reports' },
  { id: 'tutor',        icon: MessageSquare,   label: 'AI Tutor' },
  { id: 'practice',     icon: Target,          label: 'Practice Questions' },
  { id: 'flashcards',   icon: Brain,           label: 'Flashcards' },
]

export default function Sidebar({ active, onNavigate, dueCount = 0 }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-bg-secondary border-r border-border flex flex-col transition-all duration-300 z-30"
      style={{ width: collapsed ? '64px' : '220px' }}
    >
      <div className="h-14 flex items-center px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-display text-sm font-bold text-text-primary block leading-tight whitespace-nowrap">Finance</span>
              <span className="font-display text-xs font-bold text-accent block leading-tight whitespace-nowrap">MENTOR PRO</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = active === id
          const showBadge = id === 'flashcards' && dueCount > 0
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative group
                ${isActive
                  ? 'bg-accent/10 text-accent border-r-2 border-accent'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
            >
              <div className="relative flex-shrink-0">
                <Icon size={16} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-negative rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {dueCount > 9 ? '9+' : dueCount}
                  </span>
                )}
              </div>
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-bg-card border border-border rounded-md text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg">
                  {label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all
            ${active === 'settings' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2.5 text-text-muted hover:text-text-secondary transition-colors"
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <div className="flex items-center gap-1.5 text-xs"><ChevronLeft size={14} /><span>Collapse</span></div>
          }
        </button>
      </div>
    </aside>
  )
}
