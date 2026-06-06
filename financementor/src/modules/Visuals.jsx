import React, { useState } from 'react'
import { SectionHeader } from '../components/ui/index.jsx'
import LBOStructure from '../components/visuals/LBOStructure.jsx'
import DCFFunnel from '../components/visuals/DCFFunnel.jsx'
import ThreeStatements from '../components/visuals/ThreeStatements.jsx'
import YieldCurve from '../components/visuals/YieldCurve.jsx'
import CapitalStructureSeesaw from '../components/visuals/CapitalStructureSeesaw.jsx'

const VISUALS = [
  {
    id: 'lbo',
    title: 'LBO Capital Structure',
    emoji: '🏦',
    desc: 'Interactive debt stack showing tranches, rates, and priorities',
    topics: ['LBO Mechanics', 'Debt Structure', 'Capital Structure'],
    component: LBOStructure,
  },
  {
    id: 'dcf',
    title: 'DCF Funnel',
    emoji: '📊',
    desc: 'Revenue → Equity Value step-by-step — hover each stage',
    topics: ['DCF Valuation', 'Free Cash Flow', 'Enterprise Value'],
    component: DCFFunnel,
  },
  {
    id: 'statements',
    title: 'Three Financial Statements',
    emoji: '📋',
    desc: 'How IS, BS, and CF Statement connect — hover linked items',
    topics: ['Financial Statements', 'Net Income', 'Cash Flow'],
    component: ThreeStatements,
  },
  {
    id: 'yield',
    title: 'Yield Curve',
    emoji: '📈',
    desc: 'Normal, inverted, flat curves with real historical overlays',
    topics: ['Fixed Income', 'Yield Curve', 'Macroeconomics'],
    component: YieldCurve,
  },
  {
    id: 'seesaw',
    title: 'Capital Structure Seesaw',
    emoji: '⚖️',
    desc: 'Trade-off theory: tax shield vs distress — fully interactive',
    topics: ['Capital Structure', 'WACC', 'Modigliani-Miller'],
    component: CapitalStructureSeesaw,
  },
]

export default function Visuals({ onNavigate }) {
  const [active, setActive] = useState('lbo')
  const current = VISUALS.find(v => v.id === active)
  const Component = current?.component

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Interactive Visual Diagrams"
        subtitle="Hover, drag, and interact to build intuition — not just knowledge"
      />

      {/* Visual selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {VISUALS.map(v => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              active === v.id
                ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                : 'bg-bg-card text-text-secondary border-border hover:border-accent/50 hover:text-text-primary'
            }`}
          >
            <span>{v.emoji}</span>
            <span className="hidden sm:inline">{v.title}</span>
          </button>
        ))}
      </div>

      {/* Active visual header */}
      {current && (
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">{current.emoji} {current.title}</h2>
            <p className="text-sm text-text-secondary mt-0.5">{current.desc}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {current.topics.map(t => (
                <button
                  key={t}
                  onClick={() => onNavigate('concepts')}
                  className="px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs hover:bg-accent/20 transition-all"
                >
                  {t} →
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual component */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-5">
        {Component && <Component />}
      </div>
    </div>
  )
}
