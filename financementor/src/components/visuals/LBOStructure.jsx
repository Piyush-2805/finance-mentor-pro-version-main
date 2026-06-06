import React, { useState } from 'react'

const TRANCHES = [
  {
    label: 'Senior Secured Debt',
    pct: 40,
    color: '#1D4ED8',
    bg: '#1E3A8A',
    rate: 'SOFR + 300–400bps',
    priority: '1st lien — first claim on assets',
    holder: 'Banks, CLOs',
    risk: 'Lowest — secured by all assets',
  },
  {
    label: 'Senior Unsecured / 2nd Lien',
    pct: 25,
    color: '#4338CA',
    bg: '#312E81',
    rate: 'SOFR + 500–700bps',
    priority: '2nd in line on liquidation',
    holder: 'Institutional investors, HY funds',
    risk: 'Medium — unsecured',
  },
  {
    label: 'Mezzanine / PIK Notes',
    pct: 15,
    color: '#B45309',
    bg: '#78350F',
    rate: '11–14% (may accrue)',
    priority: 'Below senior — subordinated',
    holder: 'Mezzanine funds, CLOs',
    risk: 'High — can pay-in-kind (no cash)',
  },
  {
    label: 'Sponsor Equity',
    pct: 20,
    color: '#065F46',
    bg: '#064E3B',
    rate: 'Target: 20–25% IRR',
    priority: 'Last — residual claim',
    holder: 'Private Equity Sponsor',
    risk: 'Highest — first to absorb losses, last to benefit',
  },
]

export default function LBOStructure({ totalEV = 1000 }) {
  const [hovered, setHovered] = useState(null)
  const [entryMultiple, setEntryMultiple] = useState(10)
  const [ebitda, setEbitda] = useState(100)

  const ev = entryMultiple * ebitda

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Entry EV/EBITDA:</span>
          <input type="range" min={6} max={15} step={0.5} value={entryMultiple}
            onChange={e => setEntryMultiple(parseFloat(e.target.value))}
            className="w-24 accent-accent h-1.5 rounded-full appearance-none bg-border" />
          <span className="font-mono text-sm text-accent font-bold">{entryMultiple}x</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">EBITDA ($M):</span>
          <input type="range" min={50} max={500} step={10} value={ebitda}
            onChange={e => setEbitda(parseInt(e.target.value))}
            className="w-24 accent-accent h-1.5 rounded-full appearance-none bg-border" />
          <span className="font-mono text-sm text-gold font-bold">${ebitda}M</span>
        </div>
        <div className="text-xs text-text-muted">
          Total EV: <span className="font-mono text-text-primary font-bold">${ev.toLocaleString()}M</span>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap">
        {/* Stack diagram */}
        <div className="flex-1 min-w-48 max-w-xs">
          <p className="text-xs text-text-muted mb-2 font-semibold">PE FIRM / SPONSOR</p>
          <div className="w-px h-5 bg-border ml-4" />
          <p className="text-xs text-text-muted mb-2 ml-3 font-semibold">↓ Equity injection</p>
          <div className="w-px h-4 bg-border ml-4" />
          <p className="text-xs text-text-muted mb-2 ml-3 font-semibold">HOLDCO (Acquisition Vehicle)</p>
          <div className="w-px h-4 bg-border ml-4" />
          <p className="text-xs text-text-muted mb-3 ml-3 font-semibold">↓ Debt pushed down to Target</p>

          <div className="border border-border rounded-xl overflow-hidden">
            {TRANCHES.map((t, i) => {
              const height = Math.max(t.pct * 1.8, 40)
              const amount = Math.round(ev * t.pct / 100)
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer transition-all"
                  style={{
                    background: t.bg,
                    height: `${height}px`,
                    borderBottom: i < TRANCHES.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    filter: hovered === i ? 'brightness(1.3)' : 'brightness(1)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: t.color === '#065F46' ? '#6EE7B7' : '#E0E7FF' }}>
                    {t.label}
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white/80">{t.pct}%</div>
                    <div className="text-xs font-mono text-white/60">${amount}M</div>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-text-muted text-center mt-2">↑ Higher risk, higher return</p>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-56">
          {hovered !== null ? (
            <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
              <h4 className="font-bold text-sm text-text-primary">{TRANCHES[hovered].label}</h4>
              {[
                ['Rate / Return', TRANCHES[hovered].rate],
                ['Priority', TRANCHES[hovered].priority],
                ['Typical Holder', TRANCHES[hovered].holder],
                ['Risk Profile', TRANCHES[hovered].risk],
                ['Amount', `$${Math.round(ev * TRANCHES[hovered].pct / 100)}M (${TRANCHES[hovered].pct}%)`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-text-muted">{label}</p>
                  <p className="text-xs text-text-secondary">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-2">👆</p>
                <p className="text-xs text-text-muted">Hover a tranche for details</p>
              </div>
            </div>
          )}

          <div className="mt-3 bg-bg-secondary rounded-xl p-3">
            <p className="text-xs font-semibold text-text-muted mb-2">Key LBO Concept</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              The PE sponsor uses <span className="text-accent font-semibold">{100 - TRANCHES[3].pct}% debt</span> to
              amplify equity returns. If the company grows and the debt is repaid, a small equity investment
              becomes a large multiple — this is financial leverage in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
