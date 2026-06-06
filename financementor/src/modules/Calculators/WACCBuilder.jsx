import React, { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Input } from '../../components/ui/index.jsx'
import { FormulaBox } from '../../components/ui/index.jsx'

export default function WACCBuilder() {
  const [rf, setRf] = useState(4.5)
  const [beta, setBeta] = useState(1.2)
  const [erp, setErp] = useState(5.5)
  const [kd, setKd] = useState(6)
  const [tax, setTax] = useState(25)
  const [equityPct, setEquityPct] = useState(60)

  const debtPct = 100 - equityPct

  const ke = rf + beta * erp
  const kdAfterTax = kd * (1 - tax / 100)
  const wacc = (equityPct / 100) * ke + (debtPct / 100) * kdAfterTax
  const equityContrib = (equityPct / 100) * ke
  const debtContrib = (debtPct / 100) * kdAfterTax

  const pieData = [
    { name: `Equity (${equityPct}%)`, value: equityContrib, color: '#3B82F6' },
    { name: `Debt (${debtPct}%)`, value: debtContrib, color: '#F59E0B' },
  ]

  const MetricRow = ({ label, value, color, bold }) => (
    <div className={`flex justify-between items-center py-2 border-b border-border/50 ${bold ? 'font-bold' : ''}`}>
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`font-mono text-sm font-semibold ${color || 'text-text-primary'}`}>{value}</span>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-4">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">WACC Inputs</p>

        <div>
          <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">Cost of Equity (CAPM)</p>
          <div className="space-y-3">
            <Input label="Risk-Free Rate Rf (%)" value={rf} onChange={v => setRf(parseFloat(v)||0)} type="number" suffix="%" />
            <Input label="Equity Beta (β)" value={beta} onChange={v => setBeta(parseFloat(v)||0)} type="number" />
            <Input label="Equity Risk Premium (%)" value={erp} onChange={v => setErp(parseFloat(v)||0)} type="number" suffix="%" />
          </div>
          <div className="mt-2 bg-bg-card border border-accent/20 rounded-lg p-2 text-xs text-text-muted font-mono">
            Ke = {rf}% + {beta} × {erp}% = <span className="text-accent font-bold">{ke.toFixed(2)}%</span>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold text-gold mb-2 uppercase tracking-wider">Cost of Debt</p>
          <div className="space-y-3">
            <Input label="Pre-Tax Cost of Debt (%)" value={kd} onChange={v => setKd(parseFloat(v)||0)} type="number" suffix="%" />
            <Input label="Corporate Tax Rate (%)" value={tax} onChange={v => setTax(parseFloat(v)||0)} type="number" suffix="%" />
          </div>
          <div className="mt-2 bg-bg-card border border-gold/20 rounded-lg p-2 text-xs text-text-muted font-mono">
            Kd(post-tax) = {kd}% × (1 − {tax}%) = <span className="text-gold font-bold">{kdAfterTax.toFixed(2)}%</span>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Capital Structure</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Equity Weight</span>
              <span className="font-mono text-accent font-bold">{equityPct}%</span>
            </div>
            <input type="range" min={10} max={90} step={5} value={equityPct}
              onChange={e => setEquityPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent" />
            <div className="flex justify-between text-xs text-text-muted">
              <span>Debt: {debtPct}%</span>
              <span>Equity: {equityPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Weighted Average Cost of Capital</p>
          <p className="font-mono text-5xl font-bold text-accent">{wacc.toFixed(2)}<span className="text-2xl">%</span></p>
          <p className="text-xs text-text-muted mt-2">Minimum return required on all invested capital</p>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-3">WACC Component Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${value.toFixed(2)}%`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v.toFixed(2)}%`, 'Contribution to WACC']} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-2">Summary</p>
          <MetricRow label="Cost of Equity (Ke)" value={`${ke.toFixed(2)}%`} color="text-accent" />
          <MetricRow label="After-Tax Cost of Debt (Kd)" value={`${kdAfterTax.toFixed(2)}%`} color="text-gold" />
          <MetricRow label="Equity contribution to WACC" value={`${equityContrib.toFixed(2)}%`} />
          <MetricRow label="Debt contribution to WACC" value={`${debtContrib.toFixed(2)}%`} />
          <MetricRow label="WACC" value={`${wacc.toFixed(2)}%`} color="text-accent" bold />
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-accent mb-1">Formula</p>
          <p className="text-xs font-mono text-text-secondary">WACC = (E/V × Ke) + (D/V × Kd × (1−T))</p>
          <p className="text-xs text-text-muted mt-1">The tax shield (1−T) makes debt cheaper than equity on an after-tax basis, which is why most companies use some debt financing.</p>
        </div>
      </div>
    </div>
  )
}
