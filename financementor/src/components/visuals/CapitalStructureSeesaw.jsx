import React, { useState, useMemo } from 'react'

export default function CapitalStructureSeesaw() {
  const [debtPct, setDebtPct] = useState(40)
  const [taxRate, setTaxRate] = useState(25)
  const [distressCost, setDistressCost] = useState(8)

  const equityPct = 100 - debtPct

  const kd = 5.5
  const ke_base = 9
  const ke = ke_base + (debtPct / 100) * 4

  const taxShield = (debtPct / 100) * (taxRate / 100) * kd
  const distress = debtPct > 60 ? ((debtPct - 60) / 40) * distressCost * (debtPct / 100) : 0

  const kdAfterTax = kd * (1 - taxRate / 100)
  const wacc = (equityPct / 100) * ke + (debtPct / 100) * kdAfterTax
  const theoreticalOptimal = Math.max(20, Math.min(70, 50 - distressCost * 1.5))

  const tilt = (debtPct - 50) * 0.4
  const clampedTilt = Math.max(-25, Math.min(25, tilt))

  const waccColor = wacc < 8 ? '#22C55E' : wacc < 9.5 ? '#F59E0B' : '#EF4444'
  const isOptimal = Math.abs(debtPct - theoreticalOptimal) < 8

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-text-muted font-semibold">Debt Level</span>
            <span className="text-xs font-mono text-accent font-bold">{debtPct}%</span>
          </div>
          <input type="range" min={0} max={90} step={5} value={debtPct}
            onChange={e => setDebtPct(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-accent bg-border" />
          <div className="flex justify-between text-xs text-text-muted mt-0.5">
            <span>0% (All Equity)</span><span>90% (Highly Leveraged)</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-text-muted font-semibold">Tax Rate</span>
            <span className="text-xs font-mono text-gold font-bold">{taxRate}%</span>
          </div>
          <input type="range" min={0} max={40} step={5} value={taxRate}
            onChange={e => setTaxRate(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-gold bg-border" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-text-muted font-semibold">Distress Cost Factor</span>
            <span className="text-xs font-mono text-negative font-bold">{distressCost}</span>
          </div>
          <input type="range" min={2} max={15} step={1} value={distressCost}
            onChange={e => setDistressCost(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border" />
        </div>
      </div>

      {/* Seesaw SVG */}
      <div className="bg-bg-secondary rounded-xl p-4 overflow-hidden">
        <svg viewBox="0 0 500 200" className="w-full" style={{ maxHeight: 200 }}>
          {/* Fulcrum */}
          <polygon points="250,170 235,190 265,190" fill="#334155" />
          <rect x="220" y="188" width="60" height="8" rx="4" fill="#334155" />

          {/* Beam */}
          <g transform={`rotate(${clampedTilt}, 250, 170)`}>
            <rect x="50" y="162" width="400" height="8" rx="4" fill="#475569" />

            {/* Debt side (left) */}
            <g transform="translate(80, 100)">
              <rect x="-50" y="-60"
                width="100"
                height={Math.max(20, debtPct * 0.9)}
                rx="6"
                fill="#1D4ED8"
                opacity="0.9"
              />
              <text x="0" y={-60 + Math.max(20, debtPct * 0.9) / 2} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                Debt
              </text>
              <text x="0" y={-60 + Math.max(20, debtPct * 0.9) / 2 + 12} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">
                {debtPct}%
              </text>
              {/* Tax shield arrow */}
              <text x="0" y="-68" textAnchor="middle" fill="#22C55E" fontSize="9" fontWeight="bold">
                ↑ Tax Shield
              </text>
              {distress > 0 && (
                <text x="0" y={-48 + Math.max(20, debtPct * 0.9)} textAnchor="middle" fill="#EF4444" fontSize="9" fontWeight="bold">
                  ↓ Distress Cost
                </text>
              )}
            </g>

            {/* Equity side (right) */}
            <g transform="translate(420, 100)">
              <rect x="-50" y="-60"
                width="100"
                height={Math.max(20, equityPct * 0.9)}
                rx="6"
                fill="#065F46"
                opacity="0.9"
              />
              <text x="0" y={-60 + Math.max(20, equityPct * 0.9) / 2} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                Equity
              </text>
              <text x="0" y={-60 + Math.max(20, equityPct * 0.9) / 2 + 12} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">
                {equityPct}%
              </text>
            </g>
          </g>

          {/* WACC display at fulcrum */}
          <text x="250" y="158" textAnchor="middle" fill={waccColor} fontSize="11" fontWeight="bold">
            WACC: {wacc.toFixed(1)}%
          </text>
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted mb-1">WACC</p>
          <p className="font-mono text-xl font-bold" style={{ color: waccColor }}>{wacc.toFixed(2)}%</p>
        </div>
        <div className="bg-bg-card border border-positive/30 rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Tax Shield Benefit</p>
          <p className="font-mono text-xl font-bold text-positive">+{taxShield.toFixed(2)}%</p>
        </div>
        <div className="bg-bg-card border border-negative/30 rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Distress Cost</p>
          <p className="font-mono text-xl font-bold text-negative">−{distress.toFixed(2)}%</p>
        </div>
        <div className="bg-bg-card border border-gold/30 rounded-xl p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Cost of Equity (Ke)</p>
          <p className="font-mono text-xl font-bold text-gold">{ke.toFixed(1)}%</p>
        </div>
      </div>

      {/* Status message */}
      <div className={`rounded-xl p-3 border text-sm font-medium ${
        isOptimal ? 'bg-positive/5 border-positive/30 text-positive' :
        debtPct < theoreticalOptimal - 8 ? 'bg-accent/5 border-accent/30 text-accent' :
        'bg-negative/5 border-negative/30 text-negative'
      }`}>
        {isOptimal
          ? `✓ Near optimal capital structure (~${theoreticalOptimal}% debt). Tax shield benefit roughly offsets financial distress costs.`
          : debtPct < theoreticalOptimal - 8
          ? `↑ Underleveraged at ${debtPct}% debt. The company could take on more debt to reduce WACC via the tax shield without significant distress risk.`
          : `⚠ Overleveraged at ${debtPct}% debt. Financial distress costs are outweighing the tax shield benefit, pushing WACC higher.`
        }
      </div>

      {/* Theory notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-bg-secondary rounded-xl p-3">
          <p className="font-bold text-text-primary mb-1">Modigliani-Miller (No Tax)</p>
          <p className="text-text-muted leading-relaxed">Capital structure is irrelevant. Value = PV of cash flows regardless of how financed. WACC constant.</p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-3">
          <p className="font-bold text-positive mb-1">MM with Tax (Prop II)</p>
          <p className="text-text-muted leading-relaxed">Debt creates tax shield = interest × tax rate. Optimal = 100% debt. But ignores distress.</p>
        </div>
        <div className="bg-bg-secondary rounded-xl p-3">
          <p className="font-bold text-gold mb-1">Trade-Off Theory</p>
          <p className="text-text-muted leading-relaxed">Balance tax shield benefit against financial distress cost. Optimal debt = where WACC is minimized.</p>
        </div>
      </div>
    </div>
  )
}
