import React, { useState, useRef, useEffect } from 'react'
import { callClaude } from '../utils/claude.js'
import { Send, Copy, Check, BookOpen } from 'lucide-react'

const SYSTEM_PROMPT = `You are a senior finance professional and educator with experience at Goldman Sachs M&A, Morgan Stanley Equity Research, and JP Morgan Capital Markets. You teach finance with:
- Precise, correct formulas (always show full expression with every variable defined)
- Real documented deal examples (cite actual company names, deal values, and years — never fabricate)
- Structured frameworks (use numbered steps, clear logic, build from fundamentals)
- Adaptive depth (read the user's level from their question — beginner questions get first-principles explanations, advanced questions get full professional depth)

When explaining a concept: define it plainly first, then go deep. When giving an example: always cite the real deal with the actual figure. When walking through a model: show every step. Never be vague. Never say "it depends" without explaining what it depends on and why.`

const SUGGESTED_PROMPTS = {
  Foundation: [
    'What is the difference between equity and debt?',
    'How do I read an income statement?',
    'What does an investment banker actually do day-to-day?',
    'Explain the 2008 financial crisis in simple terms',
    'What is the difference between a stock and a bond?',
  ],
  'Core Finance': [
    'Walk me through a full DCF valuation from scratch',
    'Explain WACC — every component with formulas',
    'How does an LBO work and how are returns calculated?',
    'Why do bond prices fall when interest rates rise?',
    'Explain the Modigliani-Miller theorem in plain English',
  ],
  Advanced: [
    'Walk me through a full FCFE model — when do you use it vs FCFF?',
    'Explain how MBS pricing works and why they failed in 2008',
    'How do you value a company with negative earnings?',
    'Explain the swap rate curve and how it differs from the yield curve',
    'How does a hostile takeover defence work in practice?',
  ],
  Professional: [
    'How do pension funds build capital market expectations?',
    'Explain liability-driven investing with a worked example',
    'What is active share and what does it tell you about a manager?',
    'How do you stress-test a fixed income portfolio?',
    'Walk me through a full strategic asset allocation process',
  ],
}

function Message({ msg }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        isUser ? 'bg-gold text-white' : 'bg-accent text-white'
      }`}>
        {isUser ? 'You' : 'FM'}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-accent text-white rounded-tr-sm'
            : 'bg-bg-card border border-border text-text-secondary rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        {!isUser && (
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors px-1">
            {copied ? <Check size={11} className="text-positive" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">FM</div>
      <div className="bg-bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export default function AITutor({ hasApiKey, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello — I'm your AI Finance Tutor, trained to give you Goldman Sachs-level precision on any finance topic.\n\nAsk me anything: from the basics of how bonds work to walking through a full LBO model with real numbers. I'll explain with precise formulas, real deal examples, and adapt to your level.\n\nWhat would you like to learn today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeLevel, setActiveLevel] = useState('Core Finance')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    if (!hasApiKey) { onNavigate('settings'); return }

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setLoading(true)

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: userText })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': JSON.parse(localStorage.getItem('fm_settings') || '{}').apiKey || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)

      const reply = data.content[0].text
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${e.message}. Check your API key in Settings.` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const showSuggestions = messages.length === 1

  return (
    <div className="flex flex-col animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Chat container */}
      <div className="flex-1 bg-bg-secondary border border-border rounded-2xl flex flex-col overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts */}
        {showSuggestions && (
          <div className="px-5 pb-3 border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Suggested questions</p>
              <div className="flex gap-1">
                {Object.keys(SUGGESTED_PROMPTS).map(level => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-2 py-0.5 rounded text-xs transition-all ${activeLevel === level ? 'bg-accent text-white' : 'text-text-muted hover:text-text-secondary'}`}
                  >
                    {level === 'Core Finance' ? 'Core' : level === 'Professional' ? 'Pro' : level}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS[activeLevel]?.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 bg-bg-card border border-border rounded-full text-xs text-text-secondary hover:border-accent hover:text-accent transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          {!hasApiKey && (
            <div className="mb-3 flex items-center justify-between bg-gold/10 border border-gold/30 rounded-lg px-3 py-2">
              <p className="text-xs text-gold">Add API key to enable the tutor</p>
              <button onClick={() => onNavigate('settings')} className="text-xs text-gold font-semibold hover:underline">Settings →</button>
            </div>
          )}
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={hasApiKey ? 'Ask any finance question... (Enter to send)' : 'Add API key in Settings to use the AI Tutor'}
              disabled={!hasApiKey || loading}
              rows={2}
              className="flex-1 bg-bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none disabled:opacity-50"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || !hasApiKey}
              className="p-3 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1.5 text-center">Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
