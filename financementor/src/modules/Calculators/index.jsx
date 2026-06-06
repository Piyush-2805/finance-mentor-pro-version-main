import React, { useState } from 'react'
import { SectionHeader } from '../../components/ui/index.jsx'
import DCFCalculator from './DCFCalculator.jsx'
import LBOCalculator from './LBOCalculator.jsx'
import BlackScholesCalculator from './BlackScholes.jsx'
import BondAnalyzer from './BondAnalyzer.jsx'
import WACCBuilder from './WACCBuilder.jsx'

const TABS = [
  { id: 'dcf',    label: 'DCF Valuation',   emoji: '📊', desc: 'Discounted Cash Flow model with sensitivity analysis' },
  { id: 'lbo',    label: 'LBO Returns',      emoji: '🏦', desc: 'Leveraged Buyout IRR and MOIC calculator' },
  { id: 'bs',     label: 'Black-Scholes',    emoji: '📈', desc: 'Options pricing with full Greeks display' },
  { id: 'bond',   label: 'Bond Analyzer',    emoji: '📋', desc: 'Bond price, duration, convexity, and yield curve' },
  { id: 'wacc',   label: 'WACC Builder',     emoji: '⚖️', desc: 'Weighted Average Cost of Capital from components' },
]

export default function Calculators() {
  const [active, setActive] = useState('dcf')
  const current = TABS.find(t => t.id === active)

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Financial Calculators"
        subtitle="Professional-grade models with live visualization — all calculations run locally in your browser"
      />

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              active === tab.id
                ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                : 'bg-bg-card text-text-secondary border-border hover:border-accent/50 hover:text-text-primary'
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active tab description */}
      <div className="mb-4 px-1">
        <p className="text-xs text-text-muted">{current?.emoji} <span className="font-semibold text-text-secondary">{current?.label}:</span> {current?.desc}</p>
      </div>

      {/* Calculator content */}
      <div>
        {active === 'dcf'  && <DCFCalculator />}
        {active === 'lbo'  && <LBOCalculator />}
        {active === 'bs'   && <BlackScholesCalculator />}
        {active === 'bond' && <BondAnalyzer />}
        {active === 'wacc' && <WACCBuilder />}
      </div>
    </div>
  )
}
