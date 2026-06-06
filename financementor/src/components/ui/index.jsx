import React, { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'

// ─── Card ───────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false, onClick }) => (
  <div
    className={`bg-bg-card border border-border rounded-xl p-4 fm-card ${hover ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

// ─── Badge ──────────────────────────────────────────────
const BADGE_STYLES = {
  blue: 'bg-accent/10 text-accent border-accent/20',
  green: 'bg-positive/10 text-positive border-positive/20',
  red: 'bg-negative/10 text-negative border-negative/20',
  gold: 'bg-gold/10 text-gold border-gold/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  gray: 'bg-bg-secondary text-text-secondary border-border',
  foundation: 'bg-green-500/10 text-green-400 border-green-500/20',
  cfa1: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cfa2: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cfa3: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export const Badge = ({ children, variant = 'blue', className = '' }) => (
  <span className={`chip border ${BADGE_STYLES[variant] || BADGE_STYLES.gray} text-xs ${className}`}>
    {children}
  </span>
)

// ─── Formula Box ────────────────────────────────────────
export const FormulaBox = ({ formula, className = '' }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(formula)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`formula-box ${className}`}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded text-text-muted hover:text-text-secondary transition-colors"
      >
        {copied ? <Check size={14} className="text-positive" /> : <Copy size={14} />}
      </button>
      <code className="text-gold font-mono text-sm leading-relaxed">{formula}</code>
    </div>
  )
}

// ─── Skeleton Loader ────────────────────────────────────
export const Skeleton = ({ className = '', lines = 1 }) => {
  if (lines === 1) return <div className={`skeleton h-4 ${className}`} />
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}

export const CardSkeleton = () => (
  <Card>
    <Skeleton className="w-1/3 h-3 mb-3" />
    <Skeleton lines={4} />
    <div className="mt-4 flex gap-2">
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  </Card>
)

// ─── Progress Ring ──────────────────────────────────────
export const ProgressRing = ({ percent = 0, size = 56, strokeWidth = 4, color = '#3B82F6', label }) => {
  const r = (size - strokeWidth * 2) / 2
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1E293B" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {label !== undefined && (
        <span className="absolute text-xs font-mono font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  )
}

// ─── Toast ──────────────────────────────────────────────
let toastId = 0
const toastListeners = new Set()

export const showToast = (message, type = 'info') => {
  const id = ++toastId
  toastListeners.forEach(fn => fn({ id, message, type }))
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 3500)
    }
    toastListeners.add(handler)
    return () => toastListeners.delete(handler)
  }, [])

  const COLORS = { info: 'border-accent', success: 'border-positive', error: 'border-negative', warning: 'border-gold' }
  const ICONS = { info: 'ℹ️', success: '✓', error: '✗', warning: '⚠️' }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 bg-bg-card border ${COLORS[t.type]} rounded-lg px-4 py-3 shadow-lg text-sm animate-fade-in min-w-48`}>
          <span>{ICONS[t.type]}</span>
          <span className="text-text-primary">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Section Header ─────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="font-display text-xl font-bold text-text-primary">{title}</h2>
      {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)

// ─── Error State ────────────────────────────────────────
export const ErrorState = ({ message, onRetry }) => (
  <Card className="text-center py-8">
    <div className="text-negative text-2xl mb-2">⚠</div>
    <p className="text-text-secondary text-sm mb-4">{message || 'Failed to load content'}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary text-sm">
        Try Again
      </button>
    )}
  </Card>
)

// ─── Empty State ────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-4xl mb-3">{icon || '📭'}</div>
    <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
    {description && <p className="text-text-secondary text-sm max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

// ─── Divider ────────────────────────────────────────────
export const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-border" />
    {label && <span className="text-text-muted text-xs">{label}</span>}
    <div className="flex-1 h-px bg-border" />
  </div>
)

// ─── Input ──────────────────────────────────────────────
export const Input = ({ label, value, onChange, type = 'text', placeholder, suffix, prefix, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="text-xs text-text-secondary font-medium">{label}</label>}
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-text-muted text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-bg-secondary border border-border rounded-lg py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'}`}
      />
      {suffix && <span className="absolute right-3 text-text-muted text-xs">{suffix}</span>}
    </div>
  </div>
)

// ─── Slider ─────────────────────────────────────────────
export const Slider = ({ label, value, onChange, min = 0, max = 100, step = 1, format, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="flex justify-between items-center">
      {label && <label className="text-xs text-text-secondary font-medium">{label}</label>}
      <span className="text-xs font-mono text-gold">{format ? format(value) : value}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
    />
  </div>
)
