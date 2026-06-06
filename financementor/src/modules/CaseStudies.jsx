import React, { useState } from 'react'
import { Card, Badge, Skeleton, ErrorState, SectionHeader, showToast } from '../components/ui/index.jsx'
import { getCachedContent } from '../utils/claude.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { X, ExternalLink } from 'lucide-react'

const TIERS = [
  { id: 'micro',  label: 'Micro',      range: '<$100M',       color: '#22C55E', emoji: '🟢' },
  { id: 'small',  label: 'Small-Cap',  range: '$100M–$1B',    color: '#3B82F6', emoji: '🔵' },
  { id: 'mid',    label: 'Mid-Market', range: '$1B–$10B',     color: '#8B5CF6', emoji: '⚪' },
  { id: 'large',  label: 'Large-Cap',  range: '$10B–$100B',   color: '#F59E0B', emoji: '🟠' },
  { id: 'mega',   label: 'Mega-Deal',  range: '>$100B',       color: '#EF4444', emoji: '🔴' },
]

const DEALS = {
  micro: [
    { name: "Google acquires Android Inc.", year: "2005", value: "~$50M", type: "Strategic Acqui-hire", teaser: "The deal that launched the mobile era — bought for the team and the OS kernel." },
    { name: "Facebook acquires Instagram", year: "2012", value: "$1B", type: "Social Media M&A", teaser: "Bought with 13 employees. One of the highest-return acquisitions in history." },
    { name: "Yahoo acquires Flickr", year: "2005", value: "~$25M", type: "Consumer Tech", teaser: "A case study in integration failure that killed a market-leading product." },
  ],
  small: [
    { name: "Mid-market healthcare LBO (KKR)", year: "2018", value: "$350M", type: "PE Buyout", teaser: "6× EBITDA entry, 22% IRR over 5 years through operational improvements." },
    { name: "Microsoft acquires GitHub", year: "2018", value: "$7.5B", type: "Strategic Tech M&A", teaser: "Developer community acquisition that proved more valuable than the price implied." },
    { name: "Amazon acquires Ring", year: "2018", value: "$1.2B", type: "Smart Home M&A", teaser: "Smart home bolt-on that became central to Amazon's home ecosystem strategy." },
  ],
  mid: [
    { name: "Microsoft acquires Skype", year: "2011", value: "$8.5B", type: "Strategic M&A", teaser: "Paid 32× EBITDA. Mixed integration results but valuable IP and user base." },
    { name: "HP acquires Autonomy", year: "2011", value: "$11.1B", type: "Cautionary Tale", teaser: "$8.8B write-down in one year. The most studied due diligence failure." },
    { name: "Disney acquires Pixar", year: "2006", value: "$7.4B", type: "Value Creation", teaser: "All-stock deal. Returned Disney animation to dominance. Textbook synergy case." },
  ],
  large: [
    { name: "Dell acquires EMC", year: "2016", value: "$67B", type: "Transformational M&A", teaser: "Largest tech deal ever at the time. Michael Dell's bold bet on enterprise IT." },
    { name: "AT&T acquires Time Warner", year: "2018", value: "$85B", type: "Vertical Integration", teaser: "DOJ fought it in court. Landmark case for vertical integration antitrust." },
    { name: "Elon Musk acquires Twitter", year: "2022", value: "$44B", type: "LBO-Style Buyout", teaser: "$13B bank debt, $33.5B equity. Highly leveraged. Controversial operational transformation." },
  ],
  mega: [
    { name: "Vodafone acquires Mannesmann", year: "2000", value: "€183B", type: "Hostile Takeover", teaser: "Largest hostile takeover in history. Months-long battle across continents." },
    { name: "AB InBev acquires SABMiller", year: "2016", value: "$107B", type: "Cross-Border Merger", teaser: "Combined 30% of global beer market. Multi-regulator, multi-currency complexity." },
    { name: "AOL merges with Time Warner", year: "2000", value: "$165B", type: "Cautionary Tale", teaser: "$99B write-down by 2002. Taught the world about overvalued currency in M&A." },
  ],
}

const SYSTEM_PROMPT = `You are an investment banking analyst writing a post-deal debrief for internal training. Use precise, verified financial details — real figures, real dates, real advisors. Be factually accurate. Be honest about failures where relevant. Never invent data.`

function buildCasePrompt(deal) {
  return `Write a comprehensive investment banking case study on: ${deal.name} (${deal.year}, ${deal.value})

Return ONLY valid JSON:
{
  "headline": "one compelling sentence describing this deal",
  "deal_stats": [{"label": "Deal Value", "value": "${deal.value}"}, {"label": "Year", "value": "${deal.year}"}, {"label": "Type", "value": "${deal.type}"}, {"label": "Advisors", "value": "known investment banks"}],
  "background": "paragraph on the companies and market context",
  "strategic_rationale": "why did the acquirer want this target — specific reasons",
  "deal_structure": "how was the deal structured: cash, stock, debt breakdown",
  "financing_breakdown": [{"label": "component 1", "amount": "amount", "pct": 40}, {"label": "component 2", "amount": "amount", "pct": 35}, {"label": "component 3", "amount": "amount", "pct": 25}],
  "key_metrics": [{"label": "EV/EBITDA", "value": "Nx"}, {"label": "Premium Paid", "value": "X%"}, {"label": "EV/Revenue", "value": "Nx"}],
  "metrics_chart": [{"name": "metric 1", "value": 0}, {"name": "metric 2", "value": 0}],
  "timeline": [{"date": "date", "event": "event", "phase": "Pre-Deal"}],
  "what_worked": ["point 1", "point 2", "point 3"],
  "what_failed": ["point 1", "point 2"],
  "outcome": "what actually happened to the combined entity",
  "finance_concepts": ["concept 1 illustrated by this deal", "concept 2"],
  "ib_work_done": "what the investment bankers actually did: pitches, fairness opinions, financing",
  "beginner_lesson": "what a beginner learns from this deal",
  "advanced_lesson": "what a senior analyst learns from this deal"
}`
}

function DealCard({ deal, tier, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-border-light transition-all group"
      style={{ '--hover-color': tier.color }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant="gray" className="text-xs">{deal.type}</Badge>
        <ExternalLink size={13} className="text-text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
      </div>
      <h3 className="font-semibold text-text-primary text-sm mb-1">{deal.name}</h3>
      <p className="font-mono text-xl font-bold mb-2" style={{ color: tier.color }}>{deal.value}</p>
      <p className="text-xs text-text-secondary leading-relaxed">{deal.teaser}</p>
      <p className="text-xs text-text-muted mt-2">{deal.year}</p>
    </div>
  )
}

function CaseModal({ deal, tier, hasApiKey, onClose, onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  React.useEffect(() => {
    if (!hasApiKey) return
    load()
  }, [])

  const load = async (refresh = false) => {
    setLoading(true); setError(null)
    const key = `case_${deal.name.replace(/\s+/g, '_').toLowerCase()}`
    if (refresh) {
      localStorage.removeItem(`fm_content_${key}`)
    }
    try {
      const result = await getCachedContent(key, SYSTEM_PROMPT, buildCasePrompt(deal), 2000)
      setData(result)
    } catch (e) {
      setError(e.message === 'NO_API_KEY' ? 'api_key' : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-bg-primary border border-border rounded-2xl w-full max-w-3xl my-4">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{tier.emoji}</span>
              <Badge variant="gray">{tier.label} · {tier.range}</Badge>
              <Badge variant="blue">{deal.type}</Badge>
            </div>
            <h2 className="font-display font-bold text-lg text-text-primary">{deal.name}</h2>
            <p className="font-mono text-xl font-bold mt-0.5" style={{ color: tier.color }}>{deal.value} · {deal.year}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-card transition-colors">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!hasApiKey && (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-3">Add API key to load the full case study</p>
              <button onClick={() => { onClose(); onNavigate('settings') }} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">Open Settings</button>
            </div>
          )}

          {hasApiKey && loading && (
            <div className="space-y-4">
              <div className="skeleton h-16 rounded-xl" />
              <div className="skeleton h-32 rounded-xl" />
              <div className="skeleton h-24 rounded-xl" />
            </div>
          )}

          {hasApiKey && error === 'api_key' && (
            <div className="text-center py-8">
              <button onClick={() => { onClose(); onNavigate('settings') }} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">Add API Key</button>
            </div>
          )}

          {hasApiKey && error && error !== 'api_key' && (
            <ErrorState message={error} onRetry={() => load()} />
          )}

          {data && (
            <div className="space-y-5">
              {/* Headline */}
              <div className="bg-bg-secondary rounded-xl p-4 border border-border">
                <p className="text-sm text-text-secondary italic">"{data.headline}"</p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-2">
                {data.deal_stats?.map((s, i) => (
                  <div key={i} className="bg-bg-card border border-border rounded-lg px-3 py-2">
                    <p className="text-xs text-text-muted">{s.label}</p>
                    <p className="text-sm font-semibold text-text-primary font-mono">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Background + Rationale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">Background</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{data.background}</p>
                </Card>
                <Card>
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">Strategic Rationale</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{data.strategic_rationale}</p>
                </Card>
              </div>

              {/* Deal structure */}
              <Card>
                <p className="text-xs font-bold text-text-muted uppercase mb-2">Deal Structure</p>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">{data.deal_structure}</p>
                {data.financing_breakdown?.length > 0 && (
                  <div className="space-y-2">
                    {data.financing_breakdown.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-3 rounded" style={{ width: `${f.pct}%`, background: ['#3B82F6','#F59E0B','#22C55E'][i] || '#8B5CF6' }} />
                        <span className="text-xs text-text-secondary">{f.label}: {f.amount} ({f.pct}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Timeline */}
              {data.timeline?.length > 0 && (
                <Card>
                  <p className="text-xs font-bold text-text-muted uppercase mb-3">Deal Timeline</p>
                  <div className="space-y-3">
                    {data.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-0.5" />
                          {i < data.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" style={{ minHeight: 16 }} />}
                        </div>
                        <div>
                          <p className="text-xs font-mono text-text-muted">{t.date}</p>
                          <p className="text-xs text-text-secondary">{t.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Outcome */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <p className="text-xs font-bold text-positive uppercase mb-2">✓ What Worked</p>
                  <ul className="space-y-1">
                    {data.what_worked?.map((w, i) => <li key={i} className="text-xs text-text-secondary flex gap-1.5"><span className="text-positive mt-0.5">•</span>{w}</li>)}
                  </ul>
                </Card>
                {data.what_failed?.length > 0 && (
                  <Card>
                    <p className="text-xs font-bold text-negative uppercase mb-2">✗ What Failed / Risk</p>
                    <ul className="space-y-1">
                      {data.what_failed.map((w, i) => <li key={i} className="text-xs text-text-secondary flex gap-1.5"><span className="text-negative mt-0.5">•</span>{w}</li>)}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Lessons */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-accent mb-2">Beginner Lesson</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{data.beginner_lesson}</p>
                </div>
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-gold mb-2">Advanced Analyst Lesson</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{data.advanced_lesson}</p>
                </div>
              </div>

              {/* Finance concepts */}
              {data.finance_concepts?.length > 0 && (
                <Card>
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">Finance Concepts Illustrated</p>
                  <div className="flex flex-wrap gap-2">
                    {data.finance_concepts.map((c, i) => (
                      <button key={i} onClick={() => { onClose(); onNavigate('concepts') }}
                        className="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs hover:bg-accent/20 transition-all">
                        {c} →
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CaseStudies({ hasApiKey, onNavigate }) {
  const [activeTier, setActiveTier] = useState('mid')
  const [selectedDeal, setSelectedDeal] = useState(null)
  const tier = TIERS.find(t => t.id === activeTier)

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Case Studies"
        subtitle="Real deals across all size tiers — from startup acqui-hires to mega-mergers"
      />

      {/* Tier selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TIERS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTier(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              activeTier === t.id
                ? 'text-white border-transparent'
                : 'bg-bg-card text-text-secondary border-border hover:border-border-light'
            }`}
            style={activeTier === t.id ? { background: t.color } : {}}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
            <span className={`text-xs ${activeTier === t.id ? 'opacity-80' : 'text-text-muted'}`}>{t.range}</span>
          </button>
        ))}
      </div>

      {/* Deal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(DEALS[activeTier] || []).map(deal => (
          <DealCard
            key={deal.name}
            deal={deal}
            tier={tier}
            onClick={() => setSelectedDeal(deal)}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedDeal && (
        <CaseModal
          deal={selectedDeal}
          tier={tier}
          hasApiKey={hasApiKey}
          onClose={() => setSelectedDeal(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}
