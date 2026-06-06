import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'

const MATURITIES = ['3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']

const CURVES = {
  normal: {
    label: 'Normal (Upward Sloping)',
    color: '#22C55E',
    values: [4.2, 4.4, 4.6, 4.8, 4.9, 5.0, 5.1, 5.2, 5.4, 5.5],
    signal: '✅ Healthy economy — investors demand more yield for longer-term risk',
    implication: 'Banks profit by borrowing short and lending long. Equities tend to perform well. Normal state for most of history.',
  },
  inverted: {
    label: 'Inverted (Downward Sloping)',
    color: '#EF4444',
    values: [5.5, 5.4, 5.2, 5.0, 4.8, 4.5, 4.3, 4.1, 3.9, 3.7],
    signal: '⚠️ Recession warning — happened before every US recession since 1955',
    implication: 'Short-term rates > long-term = market expects rate cuts ahead = economic slowdown expected. US 2Y/10Y inverted in 2022–2023.',
  },
  flat: {
    label: 'Flat',
    color: '#F59E0B',
    values: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    signal: '📊 Transition period — market uncertain about direction',
    implication: 'Occurs when moving between normal and inverted. Bank margins compressed. Often precedes inversion.',
  },
  humped: {
    label: 'Humped (Intermediate peak)',
    color: '#8B5CF6',
    values: [3.8, 4.2, 4.8, 5.1, 5.3, 5.2, 4.9, 4.6, 4.3, 4.1],
    signal: '📈 Unusual shape — often transitional',
    implication: 'Mid-term rates highest. Can signal near-term rate hike expectations followed by longer-term pessimism.',
  },
}

const HISTORICAL = {
  'Jun 2007 (Pre-Crisis)': {
    color: '#94A3B8',
    values: [4.9, 5.0, 5.1, 5.0, 4.9, 4.9, 5.0, 5.2, 5.3, 5.3],
    note: 'Flat/slightly inverted — warned of 2008 crisis',
  },
  'Mar 2020 (COVID Shock)': {
    color: '#F97316',
    values: [0.1, 0.2, 0.4, 0.3, 0.4, 0.6, 0.8, 0.9, 1.3, 1.5],
    note: 'Near-zero rates — emergency Fed response',
  },
  'Oct 2023 (Rate Peak)': {
    color: '#EC4899',
    values: [5.5, 5.5, 5.3, 5.0, 4.8, 4.7, 4.8, 4.9, 5.1, 5.1],
    note: 'Deeply inverted at short end — recession fears',
  },
}

const buildChartData = (activeCurve, showHistorical) => {
  return MATURITIES.map((mat, i) => {
    const point = { maturity: mat }
    point[activeCurve] = CURVES[activeCurve].values[i]
    if (showHistorical) {
      Object.entries(HISTORICAL).forEach(([label, data]) => {
        if (showHistorical.includes(label)) {
          point[label] = data.values[i]
        }
      })
    }
    return point
  })
}

export default function YieldCurve() {
  const [activeCurve, setActiveCurve] = useState('normal')
  const [showHistorical, setShowHistorical] = useState([])

  const curve = CURVES[activeCurve]
  const chartData = buildChartData(activeCurve, showHistorical)

  const toggleHistorical = (label) => {
    setShowHistorical(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  return (
    <div className="space-y-4">
      {/* Curve type selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CURVES).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setActiveCurve(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
            style={activeCurve === key ? { background: c.color + '22', borderColor: c.color, color: c.color } : { borderColor: '#334155', color: '#64748B' }}
          >
            <div className="w-3 h-0.5 rounded-full" style={{ background: activeCurve === key ? c.color : '#475569' }} />
            {c.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-bg-secondary rounded-xl p-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="maturity" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 7]} tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={(v, name) => [`${v.toFixed(2)}%`, name]}
              contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
            />
            <Line type="monotone" dataKey={activeCurve} stroke={curve.color} strokeWidth={2.5} dot={{ r: 3, fill: curve.color }} name={curve.label} />
            {showHistorical.map(label => (
              <Line key={label} type="monotone" dataKey={label} stroke={HISTORICAL[label].color} strokeWidth={1.5} strokeDasharray="4 2" dot={false} name={label} />
            ))}
            <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8', paddingTop: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Signal banner */}
      <div className="rounded-xl p-3 border" style={{ background: curve.color + '11', borderColor: curve.color + '44' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: curve.color }}>{curve.signal}</p>
        <p className="text-xs text-text-secondary leading-relaxed">{curve.implication}</p>
      </div>

      {/* Historical overlays */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Overlay Historical Curves</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(HISTORICAL).map(([label, data]) => (
            <button
              key={label}
              onClick={() => toggleHistorical(label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all"
              style={showHistorical.includes(label)
                ? { background: data.color + '22', borderColor: data.color, color: data.color }
                : { borderColor: '#334155', color: '#64748B' }
              }
            >
              <div className="w-3 h-0.5 rounded-full" style={{ background: showHistorical.includes(label) ? data.color : '#475569', borderBottom: '2px dashed' }} />
              {label}
            </button>
          ))}
        </div>
        {showHistorical.length > 0 && (
          <div className="mt-2 space-y-1">
            {showHistorical.map(label => (
              <p key={label} className="text-xs text-text-muted">
                <span className="font-semibold" style={{ color: HISTORICAL[label].color }}>{label}:</span>{' '}
                {HISTORICAL[label].note}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Key concept */}
      <div className="bg-bg-secondary rounded-xl p-3 grid grid-cols-3 gap-3">
        {[
          { label: 'Fed Controls', range: '0–2 Years', note: 'Via Fed Funds Rate target', color: '#3B82F6' },
          { label: 'Market Driven', range: '2–10 Years', note: 'Supply/demand of bonds + inflation expectations', color: '#8B5CF6' },
          { label: 'Long-End', range: '10–30 Years', note: 'Long-term growth and inflation expectations', color: '#F59E0B' },
        ].map(({ label, range, note, color }) => (
          <div key={label} className="text-center">
            <div className="text-xs font-bold mb-0.5" style={{ color }}>{label}</div>
            <div className="text-xs font-mono text-text-primary">{range}</div>
            <div className="text-xs text-text-muted mt-0.5">{note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
