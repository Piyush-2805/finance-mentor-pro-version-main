import React, { useState, useEffect, useMemo } from 'react'
import { Card, Badge, SectionHeader, showToast } from '../components/ui/index.jsx'
import { getCachedContent } from '../utils/claude.js'
import { getAllConcepts, TRACKS } from '../data/curriculum.js'
import { getCardState, saveCardState, updateSM2, isDueForReview, formatNextReview } from '../utils/sm2.js'
import { Brain, RotateCcw, CheckCircle } from 'lucide-react'

const SYSTEM_PROMPT = `You are creating spaced repetition flashcards for finance students. Questions must test genuine understanding, not definition recall. Be precise and factually accurate.`

const buildCardPrompt = (concept, moduleTitle) => `
Create a spaced repetition flashcard for the finance concept: "${concept}" (from ${moduleTitle})

Return ONLY valid JSON:
{
  "front": "a question that tests real understanding — ask for a formula, calculation method, or 'what would happen if...' scenario rather than just a definition",
  "back": {
    "answer": "precise, complete answer",
    "formula": "the key formula if applicable, else null",
    "anchor": "one real company or deal example that makes this concept memorable",
    "common_error": "the most common mistake people make with this concept"
  },
  "topic": "${moduleTitle}",
  "difficulty": "Foundation|Core|Advanced"
}`

const RATING_BUTTONS = [
  { label: 'Again', quality: 0, color: 'bg-negative text-white', desc: 'Total blank' },
  { label: 'Hard', quality: 2, color: 'bg-warning text-white', desc: 'Wrong but familiar' },
  { label: 'Good', quality: 4, color: 'bg-positive text-white', desc: 'Correct with effort' },
  { label: 'Easy', quality: 5, color: 'bg-accent text-white', desc: 'Instant recall' },
]

function FlipCard({ card, onFlip, flipped }) {
  return (
    <div
      onClick={onFlip}
      className="cursor-pointer select-none"
      style={{ perspective: '1000px', height: 220 }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transition: 'transform 0.5s', transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        {/* Front */}
        <div style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%' }}
          className="bg-bg-card border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <Badge variant="gray" className="mb-3">{card.topic}</Badge>
          <p className="text-base font-semibold text-text-primary leading-relaxed">{card.front}</p>
          <p className="text-xs text-text-muted mt-4">Click to reveal answer →</p>
        </div>

        {/* Back */}
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', width: '100%', height: '100%' }}
          className="bg-positive/5 border border-positive/30 rounded-2xl p-5 flex flex-col justify-center overflow-y-auto">
          <p className="text-sm font-semibold text-text-primary mb-2 leading-relaxed">{card.back?.answer}</p>
          {card.back?.formula && (
            <div className="bg-bg-card border border-border rounded-lg px-3 py-1.5 mb-2">
              <code className="text-gold font-mono text-xs">{card.back.formula}</code>
            </div>
          )}
          {card.back?.anchor && (
            <p className="text-xs text-accent mb-1"><span className="font-semibold">Real anchor:</span> {card.back.anchor}</p>
          )}
          {card.back?.common_error && (
            <p className="text-xs text-warning"><span className="font-semibold">⚠ Common error:</span> {card.back.common_error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Flashcards({ hasApiKey, onNavigate }) {
  const [mode, setMode] = useState('dashboard') // dashboard | study | browse
  const [deckFilter, setDeckFilter] = useState('due')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState(false)
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deck, setDeck] = useState([])
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 })

  const allConcepts = useMemo(() => getAllConcepts(), [])

  const dueCards = useMemo(() => {
    return allConcepts.filter(c => isDueForReview(getCardState(c.id)))
  }, [allConcepts, mode])

  const learnedCount = allConcepts.filter(c => getCardState(c.id).reps > 0).length

  const buildDeck = () => {
    const cards = deckFilter === 'due'
      ? dueCards
      : deckFilter === 'all'
      ? allConcepts
      : allConcepts.filter(c => c.trackId === deckFilter)
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
    setCurrentIdx(0)
    setFlipped(false)
    setRated(false)
    setCard(null)
    setSessionStats({ reviewed: 0, correct: 0 })
    setMode('study')
  }

  const loadCard = async (concept) => {
    if (!hasApiKey || !concept) return
    setLoading(true); setFlipped(false); setRated(false)
    try {
      const data = await getCachedContent(
        `card_${concept.id}`,
        SYSTEM_PROMPT,
        buildCardPrompt(concept.title, concept.moduleTitle),
        800
      )
      setCard(data)
    } catch (e) {
      setCard({ front: concept.title, back: { answer: 'Load your API key in Settings to see the full flashcard.', formula: null, anchor: null, common_error: null }, topic: concept.moduleTitle })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'study' && deck[currentIdx]) {
      loadCard(deck[currentIdx])
    }
  }, [currentIdx, mode, deck])

  const handleRate = (quality) => {
    const concept = deck[currentIdx]
    if (!concept) return
    const state = getCardState(concept.id)
    const newState = updateSM2(state, quality)
    saveCardState(concept.id, newState)
    setRated(true)
    setSessionStats(s => ({ reviewed: s.reviewed + 1, correct: s.correct + (quality >= 3 ? 1 : 0) }))

    if (quality >= 3) showToast('Good work! Card scheduled.', 'success')
    else showToast('Card queued for review soon.', 'info')

    setTimeout(() => {
      if (currentIdx < deck.length - 1) {
        setCurrentIdx(i => i + 1)
      } else {
        setMode('complete')
      }
    }, 400)
  }

  const conceptCardState = deck[currentIdx] ? getCardState(deck[currentIdx].id) : null

  if (mode === 'dashboard') return (
    <div className="animate-fade-in">
      <SectionHeader title="Flashcards" subtitle="Spaced repetition — review concepts right before you'd forget them" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="text-center"><p className="text-xs text-text-muted mb-1">Due Today</p><p className="font-mono text-3xl font-bold text-negative">{dueCards.length}</p></Card>
        <Card className="text-center"><p className="text-xs text-text-muted mb-1">Learned</p><p className="font-mono text-3xl font-bold text-positive">{learnedCount}</p></Card>
        <Card className="text-center"><p className="text-xs text-text-muted mb-1">Total Cards</p><p className="font-mono text-3xl font-bold text-accent">{allConcepts.length}</p></Card>
        <Card className="text-center"><p className="text-xs text-text-muted mb-1">Streak</p><p className="font-mono text-3xl font-bold text-gold">{parseInt(localStorage.getItem('fm_streak') || '0')}d</p></Card>
      </div>

      {/* Deck options */}
      <Card className="mb-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Choose Your Deck</p>
        <div className="space-y-2">
          {[
            { id: 'due', label: `Due for Review (${dueCards.length} cards)`, color: 'text-negative', badge: 'red' },
            { id: 'all', label: `All Cards (${allConcepts.length} cards)`, color: 'text-text-secondary', badge: 'gray' },
            ...Object.entries(TRACKS).map(([id, t]) => ({
              id,
              label: `${t.icon} ${t.label} (${allConcepts.filter(c => c.trackId === id).length} cards)`,
              color: 'text-text-secondary',
              badge: id,
            }))
          ].map(opt => (
            <button key={opt.id} onClick={() => setDeckFilter(opt.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${deckFilter === opt.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border-light'}`}>
              <span className={`text-sm font-medium ${deckFilter === opt.id ? 'text-accent' : opt.color}`}>{opt.label}</span>
              {deckFilter === opt.id && <CheckCircle size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      </Card>

      {!hasApiKey && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-gold">Add API key to generate AI-powered flashcard content</p>
          <button onClick={() => onNavigate('settings')} className="text-xs text-gold font-semibold hover:underline">Settings →</button>
        </div>
      )}

      <button onClick={buildDeck} disabled={deckFilter === 'due' && dueCards.length === 0}
        className="w-full py-3.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
        <Brain size={16} /> Start Review Session
      </button>
    </div>
  )

  if (mode === 'complete') return (
    <div className="animate-fade-in max-w-md mx-auto text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-display font-bold text-xl text-text-primary mb-2">Session Complete!</h2>
      <p className="text-text-secondary mb-6">{sessionStats.reviewed} cards reviewed · {sessionStats.correct} correct</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center"><p className="text-xs text-text-muted mb-1">Reviewed</p><p className="font-mono text-2xl font-bold text-accent">{sessionStats.reviewed}</p></Card>
        <Card className="text-center"><p className="text-xs text-text-muted mb-1">Accuracy</p><p className="font-mono text-2xl font-bold text-positive">{sessionStats.reviewed > 0 ? Math.round(sessionStats.correct / sessionStats.reviewed * 100) : 0}%</p></Card>
      </div>
      <button onClick={() => setMode('dashboard')} className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-all flex items-center justify-center gap-2">
        <RotateCcw size={14} /> Back to Dashboard
      </button>
    </div>
  )

  // Study mode
  const concept = deck[currentIdx]
  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMode('dashboard')} className="text-xs text-text-muted hover:text-text-secondary transition-colors">← Back</button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted font-mono">{currentIdx + 1} / {deck.length}</span>
          {conceptCardState && (
            <span className="text-xs text-text-muted">{formatNextReview(conceptCardState)}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg-secondary rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(currentIdx / deck.length) * 100}%` }} />
      </div>

      {/* Card */}
      {loading ? (
        <div className="h-52 bg-bg-card border border-border rounded-2xl flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : card ? (
        <FlipCard card={card} onFlip={() => setFlipped(!flipped)} flipped={flipped} />
      ) : null}

      {/* Rating */}
      <div className="mt-4">
        {!flipped && !rated && (
          <p className="text-center text-xs text-text-muted">Flip the card first, then rate your recall</p>
        )}
        {flipped && !rated && (
          <div>
            <p className="text-center text-xs text-text-muted mb-3">How well did you recall this?</p>
            <div className="grid grid-cols-4 gap-2">
              {RATING_BUTTONS.map(btn => (
                <button key={btn.label} onClick={() => handleRate(btn.quality)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 ${btn.color}`}>
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {RATING_BUTTONS.map(btn => (
                <p key={btn.label} className="text-xs text-center text-text-muted">{btn.desc}</p>
              ))}
            </div>
          </div>
        )}
        {rated && (
          <div className="text-center">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
