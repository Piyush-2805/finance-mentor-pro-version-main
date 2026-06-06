import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Input } from '../../components/ui/index.jsx'
import { formatPercent, formatMultiple } from '../../utils/formatters.js'

function calcLBO(inputs) {
  const { entryEV, entryMult, ebitda, ebitdaGrowth, holdPeriod, debtPct, interestRate, exitMult, taxRate } = inputs

  const entryDebt = entryEV * (debtPct / 100)
  const entryEquity = entryEV - entryDebt
  const annualInterest = entryDebt * (interestRate / 100)

  let currentDebt = entryDebt
  let currentEBITDA = ebitda

  for (let yr = 1; yr <= holdPeriod; yr++) {
    currentEBITDA = currentEBITDA * (1 + ebitdaGrowth / 100)
    const ebit = currentEBITDA * 0.7
    const taxableIncome = ebit - annualInterest
    const netIncome = taxableIncome * (1 - taxRate / 100)
    const debtRepayment = Math.max(0, netIncome * 0.7)
    currentDebt = Math.max(0, currentDebt - debtRepayment)
  }

  const exitEV = currentEBITDA * exitMult
  const exitEquity = Math.max(0, exitEV - currentDebt)
  const moic = exitEquity / entryEquity
  const irr = (Math.pow(moic, 1 / holdPeriod) - 1) * 100

  const debtPaydown = entryDebt - currentDebt
  const ebitdaGrowthContrib = (currentEBITDA - ebitda) * exitMult
  const multipleExpansion = ebitda * (exitMult - entryMult)

  const waterfall = [
    { name: 'Entry Equity', value: entryEquity, color: '#3B82F6' },
    { name: 'Debt Paydown', value: debtPaydown, color: '#22C55E' },
    { name: 'EBITDA Growth', value: ebitdaGrowthContrib, color: '#8B5CF6' },
    { name: 'Mult Expansion', value: multipleExpansion, color: '#F59E0B' },
    { name: 'Exit Equity', value: exitEquity, color: '#22C55E' },
  ]

  return { entryEquity, exitEquity, exitEV, moic, irr, currentDebt, waterfall, exitEBITDA: currentEBITDA }
}

export default function LBOCalculator() {
  const [inputs, setInputs] = useState({
    entryEV: 1000, entryMult: 10, ebitda: 100, ebitdaGrowth: 8,
    holdPeriod: 5, debtPct: 65, interestRate: 7, exitMult: 11, taxRate: 25
  })
  const set = (key) => (val) => setInputs(p => ({ ...p, [key]: parseFloat(val) || 0 }))
  const r = useMemo(() => calcLBO(inputs), [inputs])

  const irrColor = r.irr > 20 ? '#22C55E' : r.irr > 15 ? '#F59E0B' : '#EF4444'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">LBO Inputs</p>
        <Input label="Entry Enterprise Value ($M)" value={inputs.entryEV} onChange={set('entryEV')} type="number" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Entry EV/EBITDA (x)" value={inputs.entryMult} onChange={set('entryMult')} type="number" suffix="x" />
          <Input label="EBITDA ($M)" value={inputs.ebitda} onChange={set('ebitda')} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="EBITDA Growth/yr (%)" value={inputs.ebitdaGrowth} onChange={set('ebitdaGrowth')} type="number" suffix="%" />
          <Input label="Hold Period (yrs)" value={inputs.holdPeriod} onChange={set('holdPeriod')} type="number" suffix="yrs" />
        </div>
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          <Input label="Debt (% of EV)" value={inputs.debtPct} onChange={set('debtPct')} type="number" suffix="%" />
          <Input label="Interest Rate (%)" value={inputs.interestRate} onChange={set('interestRate')} type="number" suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Exit EV/EBITDA (x)" value={inputs.exitMult} onChange={set('exitMult')} type="number" suffix="x" />
          <Input label="Tax Rate (%)" value={inputs.taxRate} onChange={set('taxRate')} type="number" suffix="%" />
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-3 mt-2">
          <p className="text-xs text-text-muted mb-2">Capital Structure at Entry</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 rounded" style={{ background: '#3B82F6', width: `${inputs.debtPct}%`, minWidth: 2 }} />
              <span className="text-xs font-mono text-accent">Debt {inputs.debtPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 rounded" style={{ background: '#22C55E', width: `${100 - inputs.debtPct}%`, minWidth: 2 }} />
              <span className="text-xs font-mono text-positive">Equity {100 - inputs.debtPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-text-muted mb-1">IRR</p>
            <p className="font-mono text-2xl font-bold" style={{ color: irrColor }}>{r.irr.toFixed(1)}%</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-text-muted mb-1">MOIC</p>
            <p className="font-mono text-2xl font-bold text-gold">{r.moic.toFixed(2)}x</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-text-muted mb-1">Exit Equity</p>
            <p className="font-mono text-xl font-bold text-positive">${Math.round(r.exitEquity).toLocaleString()}M</p>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-3">Returns Waterfall ($M)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={r.waterfall} margin={{ top: 20, right: 5, bottom: 0, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v)}M`} />
              <Tooltip formatter={(v) => [`$${Math.round(v).toLocaleString()}M`]} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {r.waterfall.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-3">Deal Summary</p>
          <table className="w-full text-xs">
            <tbody>
              {[
                ['Entry EV', `$${inputs.entryEV.toLocaleString()}M`],
                ['Entry Equity', `$${Math.round(r.entryEquity).toLocaleString()}M`],
                ['Exit EBITDA', `$${Math.round(r.exitEBITDA).toLocaleString()}M`],
                ['Exit EV', `$${Math.round(r.exitEV).toLocaleString()}M`],
                ['Remaining Debt', `$${Math.round(r.currentDebt).toLocaleString()}M`],
                ['Exit Equity', `$${Math.round(r.exitEquity).toLocaleString()}M`],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-border/50">
                  <td className="py-2 text-text-muted">{label}</td>
                  <td className="py-2 text-right font-mono text-text-primary font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
