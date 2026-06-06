import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Input } from '../../components/ui/index.jsx'

function calcBond(face, couponRate, ytm, years) {
  const c = face * (couponRate / 100) / 2  // semi-annual coupon
  const r = ytm / 100 / 2                   // semi-annual rate
  const n = years * 2                        // total periods

  if (r === 0) return null

  // Price
  let price = 0
  for (let t = 1; t <= n; t++) price += c / Math.pow(1 + r, t)
  price += face / Math.pow(1 + r, n)

  // Macaulay Duration
  let macDur = 0
  for (let t = 1; t <= n; t++) macDur += (t / 2) * (c / Math.pow(1 + r, t)) / price
  macDur += (n / 2) * (face / Math.pow(1 + r, n)) / price

  // Modified Duration
  const modDur = macDur / (1 + r)

  // Convexity
  let convexity = 0
  for (let t = 1; t <= n; t++) {
    convexity += (t * (t + 1)) * (c / Math.pow(1 + r, t + 2))
  }
  convexity += (n * (n + 1)) * (face / Math.pow(1 + r, n + 2))
  convexity = convexity / (price * 4)

  const currentYield = (c * 2) / price * 100

  return { price, macDur, modDur, convexity, currentYield }
}

function calcPriceAtYTM(face, couponRate, ytm, years) {
  const c = face * (couponRate / 100) / 2
  const r = ytm / 100 / 2
  const n = years * 2
  if (r === 0) return face
  let price = 0
  for (let t = 1; t <= n; t++) price += c / Math.pow(1 + r, t)
  price += face / Math.pow(1 + r, n)
  return price
}

export default function BondAnalyzer() {
  const [face, setFace] = useState(1000)
  const [couponRate, setCouponRate] = useState(6)
  const [ytm, setYtm] = useState(6)
  const [years, setYears] = useState(10)

  const result = useMemo(() => calcBond(face, couponRate, ytm, years), [face, couponRate, ytm, years])

  const priceYieldData = useMemo(() => {
    const data = []
    for (let y = 1; y <= 15; y += 0.5) {
      const p = calcPriceAtYTM(face, couponRate, y, years)
      data.push({ ytm: y, price: Math.round(p * 100) / 100 })
    }
    return data
  }, [face, couponRate, years])

  if (!result) return <div className="text-text-secondary text-sm p-4">Invalid inputs</div>

  const premium = result.price > face ? 'text-positive' : result.price < face ? 'text-negative' : 'text-text-secondary'
  const priceLabel = result.price > face ? 'Premium' : result.price < face ? 'Discount' : 'Par'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-bg-secondary border border-border rounded-xl p-5 space-y-3">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Bond Inputs</p>
        <Input label="Face Value ($)" value={face} onChange={v => setFace(parseFloat(v)||0)} type="number" prefix="$" />
        <Input label="Annual Coupon Rate (%)" value={couponRate} onChange={v => setCouponRate(parseFloat(v)||0)} type="number" suffix="%" />
        <Input label="Yield to Maturity (%)" value={ytm} onChange={v => setYtm(parseFloat(v)||0)} type="number" suffix="%" />
        <Input label="Years to Maturity" value={years} onChange={v => setYears(parseFloat(v)||0)} type="number" suffix="yrs" />

        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          <div className="bg-bg-card border border-border rounded-xl p-3 col-span-2">
            <p className="text-xs text-text-muted mb-1">Bond Price</p>
            <p className={`font-mono text-2xl font-bold ${premium}`}>${result.price.toFixed(2)}</p>
            <p className={`text-xs ${premium} mt-0.5`}>{priceLabel} bond ({((result.price / face - 1) * 100).toFixed(2)}% {result.price > face ? 'above' : 'below'} par)</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-text-muted mb-1">Current Yield</p>
            <p className="font-mono text-lg font-bold text-gold">{result.currentYield.toFixed(2)}%</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-text-muted mb-1">YTM</p>
            <p className="font-mono text-lg font-bold text-accent">{ytm.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Macaulay Duration</p>
            <p className="font-mono text-xl font-bold text-accent">{result.macDur.toFixed(3)}</p>
            <p className="text-xs text-text-muted mt-1">Weighted avg time to cash flows</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">Modified Duration</p>
            <p className="font-mono text-xl font-bold text-purple-400">{result.modDur.toFixed(3)}</p>
            <p className="text-xs text-text-muted mt-1">% price change per 1% yield move</p>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-4 col-span-2">
            <p className="text-xs text-text-muted mb-1">Convexity</p>
            <p className="font-mono text-xl font-bold text-gold">{result.convexity.toFixed(4)}</p>
            <p className="text-xs text-text-muted mt-1">
              1bp rate rise → price change ≈ {(-result.modDur * 0.01 * result.price).toFixed(2)} (duration) {(0.5 * result.convexity * 0.0001 * result.price).toFixed(4)} (convexity)
            </p>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted font-semibold mb-3">Price-Yield Curve (shows convexity)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={priceYieldData} margin={{ top: 5, right: 5, bottom: 0, left: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="ytm" tick={{ fontSize: 9, fill: '#64748B' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v)}`} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Bond Price']} contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine x={ytm} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Current YTM', fontSize: 9, fill: '#F59E0B', position: 'top' }} />
              <ReferenceLine y={face} stroke="#334155" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
