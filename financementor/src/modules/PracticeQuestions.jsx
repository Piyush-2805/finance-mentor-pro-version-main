import React, { useState } from 'react'
import { Card, Badge, SectionHeader, showToast } from '../components/ui/index.jsx'
import { callClaude } from '../utils/claude.js'
import { TRACKS } from '../data/curriculum.js'
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const SYSTEM_PROMPT = `You are writing finance practice questions for a student preparing for professional exams (CFA, ACCA). Questions must test genuine understanding — not rote recall. Always include precise, detailed explanations that teach the concept, not just confirm the answer.`

function buildQuizPrompt(topic, difficulty, count, type) {
  return `Generate ${count} ${difficulty} finance practice questions on: "${topic}"
Type: ${type}

Return ONLY a JSON array:
[{
  "question": "the question text",
  "type": "${type === 'Mixed' ? 'calculation|conceptual|application' : type.toLowerCase()}",
  "context": null,
  "options": ${type === 'Short Answer' ? 'null' : '["A) option text", "B) option text", "C) option text", "D) option text"]'},
  "correct": ${type === 'Short Answer' ? '"detailed answer"' : '"A|B|C|D"'},
  "explanation": "thorough explanation citing theory and a real-world example where relevant",
  "concept": "core concept tested",
  "difficulty": "${difficulty}"
}]
Return only the JSON array.`
}

function getAllTopics() {
  const topics = []
  Object.values(TRACKS).forEach(track => {
    track.modules.forEach(mod => {
      topics.push(mod.title)
    })
  })
  return topics
}

function QuizSetup({ onStart }) {
  const [topic, setTopic] = useState(getAllTopics()[4])
  const [difficulty, setDifficulty] = useState('Core Level')
  const [count, setCount] = useState(5)
  const [type, setType] = useState('Multiple Choice')

  const SelectRow = ({ label, options, value, onChange }) => (
    <div>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${value === opt ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <SectionHeader title="Practice Questions" subtitle="Test your understanding with AI-generated questions on any topic" />
      <Card className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Topic</p>
          <select
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
          >
            {Object.values(TRACKS).map(track =>
              track.modules.map(mod => (
                <option key={mod.id} value={mod.title}>{track.label} → {mod.title}</option>
              ))
            )}
          </select>
        </div>
        <SelectRow label="Difficulty" value={difficulty} onChange={setDifficulty}
          options={['Foundation', 'Core Level', 'Advanced', 'Professional']} />
        <SelectRow label="Question Type" value={type} onChange={setType}
          options={['Multiple Choice', 'Short Answer', 'Mixed']} />
        <SelectRow label="Number of Questions" value={count} onChange={v => setCount(parseInt(v))}
          options={[5, 10, 15]} />
        <button
          onClick={() => onStart({ topic, difficulty, count, type })}
          className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-all"
        >
          Generate Questions →
        </button>
      </Card>
    </div>
  )
}

function QuizSession({ config, questions, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState([])
  const [shortAnswer, setShortAnswer] = useState('')

  const q = questions[current]
  const isLast = current === questions.length - 1
  const isCorrect = q?.type !== 'short' && submitted && selected === q?.correct

  const handleSubmit = () => {
    if (!submitted) {
      setSubmitted(true)
      setAnswers(prev => [...prev, {
        question: q.question,
        correct: q.correct,
        selected: selected || shortAnswer,
        isCorrect: q.type === 'short' ? true : selected === q.correct,
        concept: q.concept,
        explanation: q.explanation,
      }])
    } else {
      if (isLast) {
        onFinish(answers)
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
        setSubmitted(false)
        setShortAnswer('')
      }
    }
  }

  const canSubmit = submitted || selected || shortAnswer.trim()

  return (
    <div className="max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((current + (submitted ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs text-text-muted font-mono">Q{current + 1}/{questions.length}</span>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="blue">{q?.type || 'question'}</Badge>
          <Badge variant="gray">{q?.concept}</Badge>
          {submitted && (q?.type === 'short' ? (
            <Badge variant="blue">Self-assessed</Badge>
          ) : isCorrect ? (
            <Badge variant="green">✓ Correct</Badge>
          ) : (
            <Badge variant="red">✗ Incorrect</Badge>
          ))}
        </div>

        <p className="text-sm font-medium text-text-primary leading-relaxed mb-4">{q?.question}</p>

        {/* Multiple choice */}
        {q?.options && (
          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i]
              const isThis = selected === letter
              const isRight = submitted && letter === q.correct
              const isWrong = submitted && isThis && letter !== q.correct
              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelected(letter)}
                  disabled={submitted}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    isRight ? 'border-positive bg-positive/5 text-positive' :
                    isWrong ? 'border-negative bg-negative/5 text-negative' :
                    isThis ? 'border-accent bg-accent/5 text-accent' :
                    'border-border text-text-secondary hover:border-border-light disabled:opacity-60'
                  }`}
                >
                  <span className="font-semibold mr-2">{letter})</span>
                  {opt.replace(/^[A-D]\)\s*/, '')}
                  {isRight && <CheckCircle size={14} className="inline ml-2" />}
                  {isWrong && <XCircle size={14} className="inline ml-2" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Short answer */}
        {!q?.options && (
          <textarea
            value={shortAnswer}
            onChange={e => !submitted && setShortAnswer(e.target.value)}
            disabled={submitted}
            placeholder="Write your answer here..."
            rows={4}
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none mb-4 disabled:opacity-60"
          />
        )}

        {/* Explanation */}
        {submitted && (
          <div className="bg-bg-secondary border border-border rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Explanation</p>
            <p className="text-xs text-text-secondary leading-relaxed">{q?.explanation}</p>
            {q?.type !== 'short' && (
              <p className="text-xs font-semibold mt-2">
                <span className="text-text-muted">Correct answer: </span>
                <span className="text-positive">{q?.correct}) {q?.options?.find(o => o.startsWith(q?.correct))?.replace(/^[A-D]\)\s*/, '')}</span>
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {!submitted ? 'Submit Answer' : isLast ? 'View Results' : 'Next Question'}
          {submitted && <ChevronRight size={14} />}
        </button>
      </Card>
    </div>
  )
}

function Results({ answers, config, onRetry, onNew }) {
  const score = answers.filter(a => a.isCorrect).length
  const pct = Math.round((score / answers.length) * 100)
  const color = pct >= 70 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'

  const conceptData = [...new Set(answers.map(a => a.concept))].map(concept => ({
    concept: concept.length > 20 ? concept.slice(0, 20) + '…' : concept,
    score: answers.filter(a => a.concept === concept && a.isCorrect).length /
           answers.filter(a => a.concept === concept).length * 100
  }))

  return (
    <div className="max-w-2xl">
      <SectionHeader title="Results" />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="text-center">
          <p className="text-xs text-text-muted mb-1">Score</p>
          <p className="font-mono text-3xl font-bold" style={{ color }}>{pct}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-muted mb-1">Correct</p>
          <p className="font-mono text-3xl font-bold text-positive">{score}/{answers.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-muted mb-1">Topic</p>
          <p className="text-xs font-semibold text-text-primary mt-1 leading-tight">{config.topic}</p>
        </Card>
      </div>

      {/* Answer review */}
      <div className="space-y-3 mb-5">
        {answers.map((a, i) => (
          <Card key={i}>
            <div className="flex items-start gap-2">
              {a.isCorrect ? <CheckCircle size={14} className="text-positive flex-shrink-0 mt-0.5" /> : <XCircle size={14} className="text-negative flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs text-text-secondary mb-1">{a.question}</p>
                <p className="text-xs font-semibold text-positive">Correct: {a.correct}</p>
                {!a.isCorrect && <p className="text-xs text-negative">Your answer: {a.selected}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onRetry} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
          <RotateCcw size={14} /> Retake
        </button>
        <button onClick={onNew} className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all">
          New Quiz
        </button>
      </div>
    </div>
  )
}

export default function PracticeQuestions({ hasApiKey, onNavigate }) {
  const [phase, setPhase] = useState('setup')
  const [config, setConfig] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState([])

  const handleStart = async (cfg) => {
    if (!hasApiKey) { onNavigate('settings'); return }
    setConfig(cfg); setLoading(true); setError(null)
    try {
      const data = await callClaude(SYSTEM_PROMPT, buildQuizPrompt(cfg.topic, cfg.difficulty, cfg.count, cfg.type), 2000)
      const qs = Array.isArray(data) ? data : []
      if (qs.length === 0) throw new Error('No questions generated')
      setQuestions(qs)
      setPhase('quiz')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl space-y-3">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-64 rounded-xl" />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl text-center py-16">
      <p className="text-negative mb-3">{error}</p>
      <button onClick={() => setPhase('setup')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold">Try Again</button>
    </div>
  )

  if (phase === 'setup') return <QuizSetup onStart={handleStart} />
  if (phase === 'quiz') return <QuizSession config={config} questions={questions} onFinish={(ans) => { setAnswers(ans); setPhase('results') }} />
  if (phase === 'results') return <Results answers={answers} config={config} onRetry={() => { setPhase('quiz') }} onNew={() => setPhase('setup')} />
}
