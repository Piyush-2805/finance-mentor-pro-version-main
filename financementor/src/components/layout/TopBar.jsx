import React from 'react'
import { Sun, Moon, Monitor, Wifi, WifiOff, Clock } from 'lucide-react'

const THEMES = [
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'bloomberg', icon: Monitor, label: 'Bloomberg' },
]

export default function TopBar({ theme, onThemeChange, hasApiKey, activeModule, studyTime }) {
  const MODULE_TITLES = {
    dashboard: 'Dashboard',
    learning: 'Learning Path',
    concepts: 'Concept Library',
    calculators: 'Calculators',
    cases: 'Case Studies',
    ratios: 'Ratio Reference',
    tutor: 'AI Tutor',
    practice: 'Practice Questions',
    flashcards: 'Flashcards',
    settings: 'Settings',
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  return (
    <header className="fixed top-0 right-0 h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-5 z-20 transition-all duration-300"
      style={{ left: 'var(--sidebar-width, 220px)' }}
    >
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-sm text-text-primary">
          {MODULE_TITLES[activeModule] || activeModule}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Study timer */}
        {studyTime > 0 && (
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Clock size={12} />
            <span className="font-mono">{formatTime(studyTime)}</span>
          </div>
        )}

        {/* API status */}
        <div className={`flex items-center gap-1.5 text-xs ${hasApiKey ? 'text-positive' : 'text-text-muted'}`}>
          {hasApiKey ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span className="hidden sm:inline">{hasApiKey ? 'API Connected' : 'No API Key'}</span>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center bg-bg-card border border-border rounded-lg overflow-hidden">
          {THEMES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onThemeChange(id)}
              className={`p-2 transition-all ${theme === id ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
              title={id}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
