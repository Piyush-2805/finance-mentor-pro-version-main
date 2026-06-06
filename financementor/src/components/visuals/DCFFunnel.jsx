import React, { useState } from 'react'

const STEPS = [
  { label: 'Revenue', color: '#1D4ED8', width: 100, subtract: '− Cost of Goods Sold (COGS)', desc: 'Total sales before any deductions. The top line.' },
  { label: 'Gross Profit', color: '#2563EB', width: 88, subtract: '− Operating Expenses, R&D, SG&A', desc: 'Revenue minus direct production costs. Shows product economics.' },
  { label: 'EBITDA', color: '#4F46E5', width: 76, subtract: '− Depreciation & Amortization (D&A)', desc: 'Earnings before interest, tax, D&A. Most common valuation metric. Free of capital structure effects.' },
  { label: 'EBIT', color: '#7C3AED', width: 65, subtract: '− Cash Taxes on EBIT', desc: 'Operating profit after depreciation. Also called "operating income".' },
  { label: 'NOPAT', color: '#6D28D9', width: 55, subtract: '+ D&A  − Capital Expenditure  ± Change in NWC', desc: 'Net Operating Profit After Tax. Tax-adjusted operating income — the clean starting point for FCF.' },
  { label: 'Free Cash Flow', color: '#059669', width: 46, subtract: '÷ Discount factor (1 + WACC)ⁿ', desc: 'Cash the business generates for all capital providers. The actual number analysts forecast in a DCF.' },
  { label: 'PV of FCFs', color: '#047857', width: 37, subtract: '+ PV of Terminal Value', desc: 'Present value of all projected free cash flows. Terminal value typically = 60–80% of total EV.' },
  { label: 'Enterprise Value', color: '#B45309', width: 29, subtract: '− Net Debt (Debt − Cash)', desc: 'What the entire business is worth to all capital providers — equity + debt holders.' },
  { label: 'Equity Value', color: '#92400E', width: 22, subtract: '÷ Shares Outstanding', desc: 'What belongs to shareholders after paying off all debt.' },
  { label: 'Intrinsic Value / Share', color: '#78350F', width: 16, subtract: null, desc: 'The per-share intrinsic value. Compare to market price to determine if the stock is cheap or expensive.' },
]

export default function DCFFunnel() {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="flex gap-6 flex-wrap">
      {/* Funnel */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        {STEPS.map((step, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-all rounded-lg py-2 px-3 text-center"
              style={{
                background: step.color,
                width: `${Math.max(step.width * 2.8, 80)}px`,
                filter: hovered === i ? 'brightness(1.3)' : 'brightness(1)',
                boxShadow: hovered === i ? `0 0 12px ${step.color}66` : 'none',
              }}
            >
              <span className="text-white text-xs font-semibold">{step.label}</span>
            </div>
            {step.subtract && (
              <div className="flex flex-col items-center">
                <div className="w-px h-2 bg-border" />
                <p className="text-xs text-text-muted text-center px-1 my-0.5" style={{ maxWidth: 220 }}>
                  {step.subtract}
                </p>
                <div className="w-px h-2 bg-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail */}
      <div className="flex-1 min-w-48">
        {hovered !== null ? (
          <div className="bg-bg-card border rounded-xl p-4 animate-fade-in sticky top-4" style={{ borderColor: STEPS[hovered].color + '66' }}>
            <div className="w-3 h-3 rounded-sm mb-2" style={{ background: STEPS[hovered].color }} />
            <h4 className="font-bold text-sm text-text-primary mb-2">{STEPS[hovered].label}</h4>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">{STEPS[hovered].desc}</p>
            {STEPS[hovered].subtract && (
              <div className="bg-bg-secondary rounded-lg p-2">
                <p className="text-xs text-text-muted">Next step:</p>
                <p className="text-xs font-mono text-gold">{STEPS[hovered].subtract}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-2xl mb-2">👆</p>
            <p className="text-xs text-text-muted">Hover any level for explanation</p>
            <div className="mt-4 bg-bg-secondary rounded-xl p-3 text-left">
              <p className="text-xs font-semibold text-text-muted mb-1">How to read this:</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Start at Revenue (top). Each step subtracts or adjusts something until you reach the intrinsic value per share at the bottom.
                Terminal value — the value beyond year 5 — typically represents 60–80% of the total Enterprise Value in most DCF models.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
