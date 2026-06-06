import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { Input } from '../../components/ui/index.jsx'

// Standard normal distribution CDF
function normCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

function normPDF(x) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI) }

function blackScholes(S, K, T, r, sigma) {
  if (T <= 0) {
    return { call: Math.max(S - K, 0), put: Math.max(K - S, 0), d1: 0, d2: 0, delta_call: S > K ? 1 : 0, delta_put: S > K ? 0 : -1, gamma: 0, theta_call: 0, theta_put: 0, vega: 0, rho_call: 0, rho_put: 0 }
  }
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)
  const call = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2)
  const put = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1)
  const delta_call = normCDF(d1)
  const delta_put = normCDF(d1) - 1
  const gamma = normPDF(d1) / (S * sigma * Math.sqrt(T))
  const theta_call = (-S * normPDF(d1) * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normCDF(d2)) / 365
  const theta_put = (-S * normPDF(d1) * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normCDF(-d2)) / 365
  const vega = S * normPDF(d1) * Math.sqrt(T) / 100
  const rho_call = K * T * Math.exp(-r * T) * normCDF(d2) / 100
  const rho_put = -K * T * Math.exp(-r * T) * normCDF(-d2) / 100
  return { call, put, d1, d2, delta_call, delta_put, gamma, theta_call, theta_put, vega, rho_call, rho_put }
}

const GreekCard = ({ label, value, desc, color = '#3B82F6' }) => (
  <div className="bg-bg-secondary border border-border rounded-xl p-3">
    <p className="text-xs text-text-muted mb-1">{label}</p>
    <p className="font-mono text-lg font-bold" style={{ color }}>{typeof value === 'number' ? value.toFixed(4) : value}</p>
    {desc && <p className="text-xs text-text-muted mt-1 leading-tight">{desc}</p>}
  </div>
)

export default function BlackScholesCalculator() {
  const [S, setS] = useState(100)
  const [K, setK] = useState(100)
  const [T, setT] = useState(1)
  const [r, setR] = useState(5)
  const [sigma, setSigma] = useState(20)

  const bs = useMemo(() => blackScholes(S, K, T, r / 100, sigma / 100), [S, K, T, r, sigma])

  const payoffData = useMemo(() => {
    const range = []
    const callCost = bs.call, putCost = bs.put
    for (let price = S * 0.5; price <= S * 1.5; price += S * 0.02) {
      range.push({
        price: Math.round(price * 100) / 100,
        longCall: Math.round((Math.max(price - K, 0) - callCost) * 100) / 100,
        longPut: Math.round((Math.max(K - price, 0) - putCost) * 100) / 100,
      })
    }
    return range
  }, [S, K, bs.call, bs.put])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Black-Scholes Inputs</p>
        <Input label="Spot Price (S)" value={S} onChange={v => setS(parseFloat(v)||0)} type="number" prefix="$" />
        <Input label="Strike Price (K)" value={K} onChange={v => setK(parseFloat(v)||0)} type="number" prefix="$" />
        <Input label="Time to Expiry (years)" value={T} onChange={v => setT(parseFloat(v)||0)} type="number" suffix="yrs" />
        <Input label="Risk-Free Rate (%)" value={r} onChange={v => setR(parseFloat(v)||0)} type="number" suffix="%" />
        <Input label="Implied Volatility (%)" value={sigma} onChange={v => setSigma(parseFloat(v)||0)} type="number" suffix="%" />

        <div className="border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-card border border-accent/30 rounded-xl p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Call Price</p>
              <p className="font-mono text-2xl font-bold text-accent">${bs.call.toFixed(2)}</p>
            </div>
            <div className="bg-bg-card border border-negative/30 rounded-xl p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Put Price</p>
              <p className="font-mono text-2xl font-bold text-negative">${bs.put.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-text-muted">
            <p className="text-center">d1 = {bs.d1.toFixed(4)}</p>
            <p className="text-center">d2 = {bs.d2.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Greeks + Chart */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <GreekCard label="Delta (Call)" value={bs.delta_call} desc="Price change per $1 move in underlying" color="#3B82F6" />
          <GreekCard label="Delta (Put)" value={bs.delta_put} desc="Price change per $1 move in underlying" color="#EF4444" />
          <GreekCard label="Gamma" value={bs.gamma} desc="Rate of Delta change per $1 move" color="#8B5CF6" />
          <GreekCard label="Vega" value={bs.vega} desc="Price change per 1% volatility change" color="#F59E0B" />
          <GreekCard label="Theta (Call)" value={bs.theta_call} desc="Daily time decay of call" color="#06B6D4" />
          <GreekCard label="Rho (Call)" value={bs.rho_call} desc="Price change per 1% rate change" color="#22C55E" />
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-3">P&L at Expiry — Long Call vs Long Put</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={payoffData} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="price" tick={{ fontSize: 9, fill: '#64748B' }} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v, n) => [`$${v.toFixed(2)}`, n === 'longCall' ? 'Long Call P&L' : 'Long Put P&L']} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
              <ReferenceLine x={K} stroke="#64748B" strokeDasharray="3 3" label={{ value: 'Strike', fontSize: 9, fill: '#64748B' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#94A3B8' }} />
              <Line type="monotone" dataKey="longCall" stroke="#3B82F6" strokeWidth={2} dot={false} name="Long Call" />
              <Line type="monotone" dataKey="longPut" stroke="#EF4444" strokeWidth={2} dot={false} name="Long Put" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
