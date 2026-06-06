import React, { useState, useEffect } from 'react'
import { Card, Badge, FormulaBox, Skeleton, CardSkeleton, ErrorState, SectionHeader, showToast } from '../components/ui/index.jsx'
import { TRACKS } from '../data/curriculum.js'
import { getCachedContent, clearCachedContent } from '../utils/claude.js'
import { ChevronRight, ChevronDown, CheckCircle, Circle, RotateCcw, BookOpen } from 'lucide-react'

const SYSTEM_PROMPT = `You are a finance professor and practitioner with investment banking and asset management experience. You teach with absolute precision — every formula is correct, every variable defined, every claim grounded in documented reality. Use real company names, real transaction values, real years. Never fabricate financial data. Adapt depth to the user's level.`

const buildUserPrompt = (topic, track) => `
Teach this finance concept comprehensively: "${topic}" (from ${track})

Return ONLY a valid JSON object — no preamble, no markdown fences:
{
  "title": "concept name",
  "plain_english": "2-3 sentence explanation a non-finance person would understand",
  "why_it_matters": "one sentence on practical significance for analysts",
  "core_explanation": "full technically precise explanation, 3-4 paragraphs",
  "formula": {
    "expression": "the formula",
    "variables": [{"symbol": "var", "name": "full name", "meaning": "what it represents"}],
    "assumptions": ["key assumption 1", "key assumption 2"],
    "limitations": ["limitation 1", "limitation 2"]
  },
  "intuition": "an analogy or mental model that makes this concept stick",
  "worked_example": {
    "setup": "realistic scenario with specific numbers",
    "steps": ["step 1 with numbers", "step 2", "step 3"],
    "answer": "final calculated answer",
    "interpretation": "what this answer means in practice"
  },
  "real_world_applications": [
    {
      "tier": "Micro (<$100M)",
      "deal": "real deal name",
      "companies": "Acquirer acquires Target",
      "year": "year",
      "value": "deal value",
      "application": "how this concept was used in the deal",
      "lesson": "what analysts learned"
    },
    {
      "tier": "Mid-Market ($1B–$10B)",
      "deal": "real deal name",
      "companies": "companies involved",
      "year": "year",
      "value": "value",
      "application": "how concept applied",
      "lesson": "lesson"
    },
    {
      "tier": "Mega-Deal (>$100B)",
      "deal": "real deal name",
      "companies": "companies",
      "year": "year",
      "value": "value",
      "application": "application",
      "lesson": "lesson"
    }
  ],
  "common_misconceptions": [{"wrong": "what people get wrong", "correct": "the right understanding"}],
  "connections": ["related concept 1", "related concept 2", "related concept 3"],
  "practice_questions": [
    {"question": "calculation or conceptual question", "type": "calculation", "answer": "detailed answer with working"},
    {"question": "application question", "type": "application", "answer": "answer"}
  ],
  "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}`

const TIER_COLORS = {
  'Micro (<$100M)': 'text-positive border-positive/30 bg-positive/5',
  'Small-Cap ($100M–$1B)': 'text-accent border-accent/30 bg-accent/5',
  'Mid-Market ($1B–$10B)': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  'Large-Cap ($10B–$100B)': 'text-gold border-gold/30 bg-gold/5',
  'Mega-Deal (>$100B)': 'text-negative border-negative/30 bg-negative/5',
}

function TopicTree({ onSelect, activeId }) {
  const [expanded, setExpanded] = useState({ foundation: true })

  return (
    <div className="overflow-y-auto h-full">
      {Object.entries(TRACKS).map(([trackId, track]) => (
        <div key={trackId} className="mb-2">
          <button
            onClick={() => setExpanded(e => ({ ...e, [trackId]: !e[trackId] }))}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
          >
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: { foundation: '#22C55E', cfa1: '#3B82F6', cfa2: '#8B5CF6', cfa3: '#F59E0B' }[trackId] }}>
              {track.label}
            </span>
            {expanded[trackId] ? <ChevronDown size={12} className="text-text-muted ml-auto" /> : <ChevronRight size={12} className="text-text-muted ml-auto" />}
          </button>

          {expanded[trackId] && track.modules.map(module => (
            <div key={module.id} className="ml-2 mb-1">
              <p className="text-xs font-semibold text-text-muted px-2 py-1">{module.title}</p>
              {module.topics.map((topic, i) => {
                const id = `${module.id}_${i}`
                const done = localStorage.getItem(`fm_topic_${module.id}_${i}`) === 'true'
                return (
                  <button
                    key={id}
                    onClick={() => onSelect({ topic, module, trackId, topicIdx: i })}
                    className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-all text-xs ${
                      activeId === id
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
                    }`}
                  >
                    {done ? <CheckCircle size={10} className="text-positive flex-shrink-0" /> : <Circle size={10} className="text-border flex-shrink-0" />}
                    <span className="truncate">{topic}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function ConceptContent({ data, conceptInfo, onRegenerate, onMarkComplete }) {
  const [showAnswers, setShowAnswers] = useState({})
  const isCompleted = localStorage.getItem(`fm_topic_${conceptInfo?.module?.id}_${conceptInfo?.topicIdx}`) === 'true'

  return (
    <div className="concept-enter space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-text-primary mb-2">{data.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{conceptInfo?.module?.title}</Badge>
            <Badge variant={conceptInfo?.trackId === 'foundation' ? 'foundation' : conceptInfo?.trackId === 'cfa1' ? 'cfa1' : conceptInfo?.trackId === 'cfa2' ? 'cfa2' : 'cfa3'}>
              {{ foundation: '🏗️ Foundation', cfa1: '📈 Core Finance', cfa2: '🔬 Advanced', cfa3: '🏆 Mastery' }[conceptInfo?.trackId]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onRegenerate} className="p-1.5 rounded-lg border border-border text-text-muted hover:text-accent hover:border-accent transition-all" title="Regenerate content">
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onMarkComplete}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isCompleted
                ? 'bg-positive/10 text-positive border border-positive/30'
                : 'bg-bg-secondary text-text-secondary border border-border hover:border-positive hover:text-positive'
            }`}
          >
            {isCompleted ? '✓ Complete' : 'Mark Complete'}
          </button>
        </div>
      </div>

      {/* Plain English */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">In Plain English</p>
        <p className="text-sm text-text-secondary leading-relaxed">{data.plain_english}</p>
        <p className="text-xs text-text-muted mt-2 italic">Why it matters: {data.why_it_matters}</p>
      </div>

      {/* Core explanation */}
      <Card>
        <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
          <BookOpen size={14} className="text-accent" /> Core Explanation
        </h3>
        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{data.core_explanation}</div>
      </Card>

      {/* Formula */}
      {data.formula && (
        <Card>
          <h3 className="font-semibold text-text-primary text-sm mb-3">Formula</h3>
          <FormulaBox formula={data.formula.expression} className="mb-4" />
          {data.formula.variables?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mb-3">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-text-muted font-semibold w-12">Symbol</th>
                    <th className="text-left py-2 pr-4 text-text-muted font-semibold">Name</th>
                    <th className="text-left py-2 text-text-muted font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {data.formula.variables.map((v, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-gold font-semibold">{v.symbol}</td>
                      <td className="py-2 pr-4 text-text-primary font-medium">{v.name}</td>
                      <td className="py-2 text-text-secondary">{v.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.formula.assumptions?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-text-muted mb-1">Key Assumptions</p>
              {data.formula.assumptions.map((a, i) => <p key={i} className="text-xs text-text-secondary">• {a}</p>)}
            </div>
          )}
          {data.formula.limitations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted mb-1">Limitations</p>
              {data.formula.limitations.map((l, i) => <p key={i} className="text-xs text-text-secondary">• {l}</p>)}
            </div>
          )}
        </Card>
      )}

      {/* Intuition builder */}
      {data.intuition && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">💡 Mental Model</p>
          <p className="text-sm text-text-secondary leading-relaxed italic">"{data.intuition}"</p>
        </div>
      )}

      {/* Worked example */}
      {data.worked_example && (
        <Card>
          <h3 className="font-semibold text-text-primary text-sm mb-3">Worked Example</h3>
          <div className="bg-bg-secondary rounded-lg p-3 mb-3 text-sm text-text-secondary">{data.worked_example.setup}</div>
          <div className="space-y-2 mb-3">
            {data.worked_example.steps?.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-text-secondary leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
          <div className="bg-positive/5 border border-positive/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-positive mb-1">Answer</p>
            <p className="text-sm text-text-primary font-medium">{data.worked_example.answer}</p>
            {data.worked_example.interpretation && (
              <p className="text-xs text-text-muted mt-1 italic">{data.worked_example.interpretation}</p>
            )}
          </div>
        </Card>
      )}

      {/* Real world applications */}
      {data.real_world_applications?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-text-primary text-sm mb-4">Real-World Applications — All Deal Sizes</h3>
          <div className="space-y-3">
            {data.real_world_applications.map((app, i) => (
              <div key={i} className={`border rounded-xl p-4 ${TIER_COLORS[app.tier] || 'border-border'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ opacity: 0.7 }}>{app.tier}</p>
                    <p className="font-semibold text-text-primary text-sm">{app.deal}</p>
                    <p className="text-xs text-text-muted">{app.companies} · {app.year} · {app.value}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-1"><span className="font-medium">How applied: </span>{app.application}</p>
                <p className="text-xs text-text-muted italic"><span className="font-medium">Lesson: </span>{app.lesson}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Common misconceptions */}
      {data.common_misconceptions?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-text-primary text-sm mb-3">⚠️ Common Misconceptions</h3>
          <div className="space-y-3">
            {data.common_misconceptions.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div className="bg-negative/5 border border-negative/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-negative mb-1">✗ Wrong</p>
                  <p className="text-xs text-text-secondary">{m.wrong}</p>
                </div>
                <div className="bg-positive/5 border border-positive/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-positive mb-1">✓ Correct</p>
                  <p className="text-xs text-text-secondary">{m.correct}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Practice questions */}
      {data.practice_questions?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-text-primary text-sm mb-3">Practice Questions</h3>
          <div className="space-y-3">
            {data.practice_questions.map((q, i) => (
              <div key={i} className="border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm text-text-primary font-medium leading-relaxed">{q.question}</p>
                  <Badge variant={q.type === 'calculation' ? 'blue' : 'purple'} className="flex-shrink-0">{q.type}</Badge>
                </div>
                <button
                  onClick={() => setShowAnswers(s => ({ ...s, [i]: !s[i] }))}
                  className="text-xs text-accent hover:underline"
                >
                  {showAnswers[i] ? 'Hide Answer ▲' : 'Show Answer ▼'}
                </button>
                {showAnswers[i] && (
                  <div className="mt-2 bg-bg-secondary rounded-lg p-3 text-xs text-text-secondary leading-relaxed">
                    {q.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Key takeaways */}
      {data.key_takeaways?.length > 0 && (
        <Card className="bg-accent/5 border-accent/20">
          <h3 className="font-semibold text-accent text-sm mb-3">Key Takeaways</h3>
          <ul className="space-y-1.5">
            {data.key_takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-accent mt-0.5">→</span>{t}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

export default function ConceptLibrary({ hasApiKey, onNavigate }) {
  const [selected, setSelected] = useState(null)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const activeId = selected ? `${selected.module.id}_${selected.topicIdx}` : null

  const loadConcept = async (info, forceRefresh = false) => {
    if (!hasApiKey) return
    setLoading(true); setError(null); setContent(null)

    const cacheKey = `concept_${info.module.id}_${info.topicIdx}`
    if (forceRefresh) clearCachedContent(cacheKey)

    try {
      const data = await getCachedContent(
        cacheKey,
        SYSTEM_PROMPT,
        buildUserPrompt(info.topic, info.module.title),
        2500
      )
      setContent(data)
    } catch (e) {
      if (e.message === 'NO_API_KEY') {
        setError('api_key')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (info) => {
    setSelected(info)
    loadConcept(info)
  }

  const handleMarkComplete = () => {
    if (!selected) return
    const key = `fm_topic_${selected.module.id}_${selected.topicIdx}`
    const current = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, !current)
    showToast(current ? 'Marked as incomplete' : '✓ Topic completed!', 'success')
    setContent(c => ({ ...c, _refresh: Date.now() }))
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex gap-4 h-full">
        {/* Left: topic tree */}
        <div className="w-56 flex-shrink-0 bg-bg-secondary border border-border rounded-xl p-3 overflow-hidden flex flex-col">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex-shrink-0">Topics</p>
          <div className="flex-1 overflow-y-auto">
            <TopicTree onSelect={handleSelect} activeId={activeId} />
          </div>
        </div>

        {/* Right: content */}
        <div className="flex-1 overflow-y-auto">
          {!selected && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-display font-bold text-lg text-text-primary mb-2">Select a topic to begin</h3>
              <p className="text-text-secondary text-sm max-w-sm">Choose any topic from the curriculum tree on the left. Each concept includes a full explanation, formula, worked example, and real deal applications across all deal sizes.</p>
              {!hasApiKey && (
                <button onClick={() => onNavigate('settings')} className="mt-4 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">
                  Add API Key in Settings
                </button>
              )}
            </div>
          )}

          {selected && loading && (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}

          {selected && error === 'api_key' && (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-text-secondary mb-3 text-sm">Add your Claude API key to load this concept.</p>
              <button onClick={() => onNavigate('settings')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">
                Open Settings
              </button>
            </div>
          )}

          {selected && error && error !== 'api_key' && (
            <ErrorState message={`Could not load content: ${error}`} onRetry={() => loadConcept(selected)} />
          )}

          {selected && !loading && !error && content && (
            <ConceptContent
              data={content}
              conceptInfo={selected}
              onRegenerate={() => loadConcept(selected, true)}
              onMarkComplete={handleMarkComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
