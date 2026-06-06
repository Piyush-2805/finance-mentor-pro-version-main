import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Input, Slider } from '../../components/ui/index.jsx'
import { formatCurrency, formatPercent, getHeatmapColor } from '../../utils/formatters.js'

function calcDCF(inputs) {
  const { revenue, g1, g2, margin, da, capex, nwc, wacc, tgr, debt, shares } = inputs
  const w = wacc / 100, tg = tgr / 100, tax = 0.25

  let fcfs = [], rev = revenue
  for (let yr = 1; yr <= 5; yr++) {
    const g = yr <= 3 ? g1 / 100 : g2 / 100
    rev = rev * (1 + g)
    const ebitda = rev * (margin / 100)
    const ebit = ebitda - rev * (da / 100)
    const nopat = ebit * (1 - tax)
    const fcf = nopat + rev * (da / 100) - rev * (capex / 100) - rev * (nwc / 100)
    const pv = fcf / Math.pow(1 + w, yr)
    fcfs.push({ year: `Y${yr}`, fcf: Math.round(fcf), pv: Math.round(pv) })
  }

  const lastFCF = fcfs[4]?.fcf || 0
  const tv = lastFCF * (1 + tg) / (w - tg)
  const pvTV = tv / Math.pow(1 + w, 5)
  const ev = fcfs.reduce((s, f) => s + f.pv, 0) + pvTV
  const equity = ev - debt
  const price = shares > 0 ? equity / shares : null

  return { fcfs, ev, equity, price, pvTV: Math.round(pvTV) }
}

function SensTable({ baseWacc, baseTgr, inputs }) {
  const waccs = [baseWacc - 2, baseWacc - 1, baseWacc, baseWacc + 1, baseWacc + 2]
  const tgrs = [baseTgr - 0.5, baseTgr, baseTgr + 0.5, baseTgr + 1, baseTgr + 1.5]

  const values = waccs.flatMap(w => tgrs.map(t => {
    const r = calcDCF({ ...inputs, wacc: w, tgr: t })
    return r.ev
  }))
  const min = Math.min(...values), max = Math.max(...values)

  return (
    <div>
      <p className="text-xs text-text-muted font-semibold mb-2">EV ($M) — WACC (rows) vs Terminal Growth (cols)</p>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-1.5 text-text-muted text-right pr-3">↓WACC / TGR→</th>
              {tgrs.map(t => <th key={t} className={`p-1.5 text-center font-mono ${t === baseTgr ? 'text-accent font-bold' : 'text-text-muted'}`}>{t.toFixed(1)}%</th>)}
            </tr>
          </thead>
          <tbody>
            {waccs.map(w => (
              <tr key={w}>
                <td className={`p-1.5 text-right pr-3 font-mono ${w === baseWacc ? 'text-gold font-bold' : 'text-text-muted'}`}>{w.toFixed(1)}%</td>
                {tgrs.map(t => {
                  const r = calcDCF({ ...inputs, wacc: w, tgr: t })
                  const color = getHeatmapColor(r.ev, min, max)
                  return (
                    <td key={t} className="p-1 text-center">
                      <div className="px-2 py-1 rounded text-xs font-mono font-semibold" style={{
                        background: `${color}22`,
                        color,
                        border: (w === baseWacc && t === baseTgr) ? `1px solid ${color}` : 'none'
                      }}>
                        {Math.round(r.ev).toLocaleString()}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DCFCalculator() {
  const [inputs, setInputs] = useState({
    revenue: 500, g1: 15, g2: 10, margin: 25, da: 5,
    capex: 8, nwc: 2, wacc: 10, tgr: 3, debt: 200, shares: 100
  })

  const set = (key) => (val) => setInputs(p => ({ ...p, [key]: parseFloat(val) || 0 }))

  const result = useMemo(() => calcDCF(inputs), [inputs])

  const chartData = [
    ...result.fcfs.map(f => ({ name: f.year, value: f.fcf, type: 'fcf' })),
    { name: 'Terminal', value: result.pvTV, type: 'tv' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">DCF Inputs</p>
        <Input label="Base Revenue ($M)" value={inputs.revenue} onChange={set('revenue')} type="number" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Growth Y1-Y3 (%)" value={inputs.g1} onChange={set('g1')} type="number" suffix="%" />
          <Input label="Growth Y4-Y5 (%)" value={inputs.g2} onChange={set('g2')} type="number" suffix="%" />
        </div>
        <Input label="EBITDA Margin (%)" value={inputs.margin} onChange={set('margin')} type="number" suffix="%" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="D&A (% Revenue)" value={inputs.da} onChange={set('da')} type="number" suffix="%" />
          <Input label="Capex (% Revenue)" value={inputs.capex} onChange={set('capex')} type="number" suffix="%" />
        </div>
        <Input label="Change in NWC (% Revenue)" value={inputs.nwc} onChange={set('nwc')} type="number" suffix="%" />
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          <Input label="WACC (%)" value={inputs.wacc} onChange={set('wacc')} type="number" suffix="%" />
          <Input label="Terminal Growth (%)" value={inputs.tgr} onChange={set('tgr')} type="number" suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Net Debt ($M)" value={inputs.debt} onChange={set('debt')} type="number" />
          <Input label="Shares (M)" value={inputs.shares} onChange={set('shares')} type="number" />
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Enterprise Value</p>
            <p className="font-mono text-xl font-bold text-accent">{formatCurrency(result.ev * 1e6)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Equity Value</p>
            <p className="font-mono text-xl font-bold text-positive">{formatCurrency(result.equity * 1e6)}</p>
          </div>
          {result.price !== null && (
            <div className="bg-bg-card border border-border rounded-xl p-4 col-span-2">
              <p className="text-xs text-text-muted mb-1">Intrinsic Value per Share</p>
              <p className="font-mono text-xl font-bold text-gold">${result.price.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-3">Free Cash Flow Projection ($M)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 15, right: 5, bottom: 0, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}M`, 'FCF']} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.type === 'tv' ? '#F59E0B' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <SensTable baseWacc={inputs.wacc} baseTgr={inputs.tgr} inputs={inputs} />
        </div>
      </div>
    </div>
  )
}
