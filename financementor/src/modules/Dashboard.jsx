import React, { useState, useEffect } from 'react'
import { Card, ProgressRing, Badge, Skeleton, SectionHeader } from '../components/ui/index.jsx'
import { TRACKS, getTrackProgress } from '../data/curriculum.js'
import { getCachedContent } from '../utils/claude.js'
import { formatPercent } from '../utils/formatters.js'
import { BookOpen, Calculator, Folder, BarChart2, MessageSquare, Target, Map, Brain } from 'lucide-react'

const MODULE_CARDS = [
  { id: 'learning',    icon: Map,           label: 'Learning Path',       desc: 'Follow the full curriculum' },
  { id: 'concepts',    icon: BookOpen,      label: 'Concept Library',     desc: 'Explore any topic in depth' },
  { id: 'calculators', icon: Calculator,    label: 'Calculators',         desc: 'DCF, LBO, Options & more' },
  { id: 'cases',       icon: Folder,        label: 'Case Studies',        desc: 'Real deals across all sizes' },
  { id: 'tutor',       icon: MessageSquare, label: 'AI Tutor',            desc: 'Ask anything, get depth' },
  { id: 'practice',    icon: Target,        label: 'Practice Questions',  desc: 'Test your understanding' },
]

const TRACK_COLORS = { foundation: '#22C55E', cfa1: '#3B82F6', cfa2: '#8B5CF6', cfa3: '#F59E0B' }

function ConceptOfDay({ hasApiKey, onNavigate }) {
  const [concept, setConcept] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!hasApiKey) return
    loadConcept()
  }, [hasApiKey])

  const loadConcept = async () => {
    setLoading(true); setError(null)
    try {
      const data = await getCachedContent(
        `concept_of_day_${new Date().toDateString()}`,
        'You are a finance professor. Return only valid JSON, no preamble.',
        `Give me one important finance concept professionals must know.
Return ONLY this JSON:
{
  "name": "concept name",
  "definition": "one precise sentence definition",
  "formula": "formula if applicable, else null",
  "real_example": "one real company/deal example with actual figures",
  "why_it_matters": "one sentence on practical significance"
}`
      )
      setConcept(data)
    } catch (e) {
      setError(e.message === 'NO_API_KEY' ? null : 'Could not load today\'s concept')
    } finally {
      setLoading(false)
    }
  }

  if (!hasApiKey) return (
    <Card className="border-accent/30 bg-accent/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔑</span>
        <div>
          <p className="text-sm font-semibold text-text-primary">Add your API Key to unlock AI content</p>
          <p className="text-xs text-text-secondary mt-1">Go to Settings and enter your Claude API key to enable all AI-powered features.</p>
          <button onClick={() => onNavigate('settings')} className="mt-2 text-xs text-accent hover:underline">Open Settings →</button>
        </div>
      </div>
    </Card>
  )

  if (loading) return (
    <Card>
      <Skeleton className="w-1/4 h-3 mb-2" />
      <Skeleton lines={3} />
    </Card>
  )

  if (error) return (
    <Card className="border-negative/30">
      <p className="text-xs text-negative">{error}</p>
      <button onClick={loadConcept} className="text-xs text-accent hover:underline mt-1">Retry</button>
    </Card>
  )

  if (!concept) return null

  return (
    <Card className="border-gold/30 bg-gold/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold text-xs font-mono font-semibold uppercase tracking-wider">Concept of the Day</span>
        <Badge variant="gold">Today</Badge>
      </div>
      <h3 className="font-display font-bold text-text-primary text-base mb-1">{concept.name}</h3>
      <p className="text-text-secondary text-sm mb-2">{concept.definition}</p>
      {concept.formula && (
        <div className="formula-box mb-2 text-xs py-2">
          <code className="text-gold font-mono">{concept.formula}</code>
        </div>
      )}
      <div className="bg-bg-secondary rounded-lg p-3 text-xs text-text-secondary">
        <span className="text-accent font-medium">Real example: </span>{concept.real_example}
      </div>
      <p className="text-xs text-text-muted mt-2 italic">{concept.why_it_matters}</p>
    </Card>
  )
}

function TrackProgressCard({ trackId, track, onNavigate }) {
  const progress = getTrackProgress(trackId)
  const color = TRACK_COLORS[trackId]
  const totalHours = track.modules.reduce((sum, m) => sum + (m.hours || 0), 0)

  return (
    <Card hover onClick={() => onNavigate('learning')} className="flex items-center gap-4">
      <ProgressRing percent={progress} size={52} strokeWidth={4} color={color} label={`${progress}%`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm text-text-primary">{track.label}</span>
        </div>
        <p className="text-xs text-text-secondary truncate">{track.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-text-muted">{track.modules.length} modules</span>
          <span className="text-xs text-text-muted">~{totalHours}h</span>
        </div>
      </div>
    </Card>
  )
}

function StudyTimer() {
  const [seconds, setSeconds] = useState(() => {
    const today = new Date().toDateString()
    return parseInt(localStorage.getItem(`fm_time_${today}`) || '0')
  })
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let interval
    if (running) {
      interval = setInterval(() => {
        setSeconds(s => {
          const newVal = s + 1
          localStorage.setItem(`fm_time_${new Date().toDateString()}`, newVal)
          return newVal
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [running])

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <Card>
      <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-mono">Today's Study Time</p>
      <p className="font-mono text-2xl font-bold text-text-primary mb-3">{fmt(seconds)}</p>
      <button
        onClick={() => setRunning(!running)}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${running
          ? 'bg-negative/10 text-negative border border-negative/30 hover:bg-negative/20'
          : 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
        }`}
      >
        {running ? '⏸ Pause' : '▶ Start Session'}
      </button>
    </Card>
  )
}

export default function Dashboard({ onNavigate, hasApiKey }) {
  const streak = parseInt(localStorage.getItem('fm_streak') || '0')

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Welcome to FinanceMentor Pro"
        subtitle="Your structured path from financial literacy to professional-level mastery"
      />

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <p className="text-xs text-text-muted mb-1">Study Streak</p>
          <p className="font-mono text-2xl font-bold text-gold">{streak}</p>
          <p className="text-xs text-text-muted">days</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted mb-1">Total Topics</p>
          <p className="font-mono text-2xl font-bold text-accent">100+</p>
          <p className="text-xs text-text-muted">across 4 tracks</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted mb-1">Deal Cases</p>
          <p className="font-mono text-2xl font-bold text-purple-400">15</p>
          <p className="text-xs text-text-muted">micro to mega</p>
        </Card>
        <StudyTimer />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Concept of day + Quick modules */}
        <div className="lg:col-span-2 space-y-4">
          <ConceptOfDay hasApiKey={hasApiKey} onNavigate={onNavigate} />

          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-mono mb-3">Quick Access</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MODULE_CARDS.map(({ id, icon: Icon, label, desc }) => (
                <Card key={id} hover onClick={() => onNavigate(id)} className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                      <Icon size={14} className="text-accent" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{label}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Track progress */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wider font-mono">Curriculum Progress</p>
          {Object.entries(TRACKS).map(([id, track]) => (
            <TrackProgressCard key={id} trackId={id} track={track} onNavigate={onNavigate} />
          ))}
          <button
            onClick={() => onNavigate('learning')}
            className="w-full py-3 rounded-xl border border-accent/30 text-accent text-sm font-medium hover:bg-accent/10 transition-all"
          >
            Open Learning Path →
          </button>
        </div>
      </div>
    </div>
  )
}
