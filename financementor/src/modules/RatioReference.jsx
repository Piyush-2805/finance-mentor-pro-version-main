import React, { useState, useEffect } from 'react'
import { Card, Badge, Skeleton, SectionHeader, showToast } from '../components/ui/index.jsx'
import { getCachedContent } from '../utils/claude.js'
import { Search, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

const CATEGORIES = ['All', 'Liquidity', 'Profitability', 'Leverage', 'Efficiency', 'Valuation', 'Market', 'Risk']

const SYSTEM_PROMPT = `You are a financial analysis expert writing a comprehensive ratio reference guide for investment banking and CFA exam preparation.`

const RATIOS_PROMPT = `Return a JSON array of 25 key financial ratios used in investment banking, equity research, credit analysis, and CFA exams. Cover all categories: Liquidity, Profitability, Leverage, Efficiency, Valuation, Market, and Risk.

For each ratio use this exact structure:
{
  "category": "Liquidity|Profitability|Leverage|Efficiency|Valuation|Market|Risk",
  "name": "ratio name",
  "formula": "formula expression",
  "what_it_measures": "one sentence",
  "how_to_interpret": "what high/low means",
  "healthy_range": "typical good range",
  "red_flag": "what signals a problem",
  "real_example": "real company, real figure, real year"
}

Return ONLY a valid JSON array. No text before or after. No markdown.`

const CATEGORY_COLORS = {
  Liquidity: 'blue',
  Profitability: 'green',
  Leverage: 'red',
  Efficiency: 'purple',
  Valuation: 'gold',
  Market: 'cfa1',
  Risk: 'gray',
}

function RatioCard({ ratio }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(ratio.formula)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Formula copied', 'success')
  }

  return (
    <Card hover onClick={() => setExpanded(!expanded)} className="transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={CATEGORY_COLORS[ratio.category] || 'gray'}>{ratio.category}</Badge>
            <h3 className="font-semibold text-text-primary text-sm">{ratio.name}</h3>
          </div>
          <div className="flex items-center gap-2 bg-bg-secondary rounded-lg px-3 py-1.5">
            <code className="text-gold font-mono text-xs flex-1">{ratio.formula}</code>
            <button onClick={handleCopy} className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0">
              {copied ? <Check size={11} className="text-positive" /> : <Copy size={11} />}
            </button>
          </div>
        </div>
        {expanded ? <ChevronDown size={14} className="text-text-muted flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-text-muted flex-shrink-0 mt-1" />}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2.5">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase mb-0.5">What it measures</p>
            <p className="text-xs text-text-secondary">{ratio.what_it_measures}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase mb-0.5">How to interpret</p>
            <p className="text-xs text-text-secondary">{ratio.how_to_interpret}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-positive/5 border border-positive/20 rounded-lg p-2">
              <p className="text-xs font-semibold text-positive mb-0.5">Healthy range</p>
              <p className="text-xs text-text-secondary">{ratio.healthy_range}</p>
            </div>
            <div className="bg-negative/5 border border-negative/20 rounded-lg p-2">
              <p className="text-xs font-semibold text-negative mb-0.5">Red flag</p>
              <p className="text-xs text-text-secondary">{ratio.red_flag}</p>
            </div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-2">
            <p className="text-xs font-semibold text-accent mb-0.5">Real example</p>
            <p className="text-xs text-text-secondary">{ratio.real_example}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function RatioReference({ hasApiKey, onNavigate }) {
  const [ratios, setRatios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    if (hasApiKey) loadRatios()
  }, [hasApiKey])

  const loadRatios = async () => {
    setLoading(true); setError(null)
    try {
      const data = await getCachedContent('ratios_master_v2', SYSTEM_PROMPT, RATIOS_PROMPT, 4000)
      setRatios(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message === 'NO_API_KEY' ? 'api_key' : e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = ratios.filter(r => {
    const matchesSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.formula.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || r.category === category
    return matchesSearch && matchesCategory
  })

  const byCategory = CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = ratios.filter(r => r.category === cat).length
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Ratio Reference"
        subtitle="Complete financial ratio library — click any ratio to expand with interpretation and real examples"
      />

      {!hasApiKey ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-text-secondary mb-3">Add your API key to load the full ratio reference library</p>
          <button onClick={() => onNavigate('settings')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">Open Settings</button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-negative mb-3">{error}</p>
          <button onClick={loadRatios} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">Retry</button>
        </div>
      ) : (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5">
            {Object.entries(byCategory).map(([cat, count]) => (
              <button key={cat} onClick={() => setCategory(cat === category ? 'All' : cat)}
                className={`text-center p-2 rounded-lg border transition-all text-xs ${category === cat ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:border-border-light'}`}>
                <p className="font-mono font-bold text-sm">{count}</p>
                <p className="truncate">{cat}</p>
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ratios or formulas..."
                className="w-full bg-bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === cat ? 'bg-accent text-white border-accent' : 'border-border text-text-muted hover:border-border-light'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ratio count */}
          <p className="text-xs text-text-muted mb-3">{filtered.length} ratio{filtered.length !== 1 ? 's' : ''} {search || category !== 'All' ? 'found' : 'total'}</p>

          {/* Ratio cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((ratio, i) => <RatioCard key={i} ratio={ratio} />)}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted">No ratios match your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
