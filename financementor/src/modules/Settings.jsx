import React, { useState } from 'react'
import { Card, Badge, SectionHeader, showToast } from '../components/ui/index.jsx'
import { testConnection } from '../utils/claude.js'
import { testGeminiConnection } from '../utils/gemini.js'
import { Key, Wifi, WifiOff, RotateCcw, Download, Trash2, CheckCircle, Zap } from 'lucide-react'

const getSettings = () => {
  try { return JSON.parse(localStorage.getItem('fm_settings') || '{}') } catch { return {} }
}

const SelectGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2 mt-1">
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          value === opt.value
            ? 'bg-accent text-white border-accent'
            : 'bg-transparent text-text-secondary border-border hover:border-accent/50'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

export default function Settings({ onSave }) {
  const saved = getSettings()
  const [apiKey, setApiKey] = useState(saved.apiKey || '')
  const [geminiKey, setGeminiKey] = useState(saved.geminiKey || '')
  const [level, setLevel] = useState(saved.level || 'Core Finance')
  const [style, setStyle] = useState(saved.style || 'Case-Study Driven')
  const [theme, setTheme] = useState(saved.theme || 'dark')
  const [fontSize, setFontSize] = useState(saved.fontSize || 'medium')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testingGemini, setTestingGemini] = useState(false)
  const [geminiResult, setGeminiResult] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    const settings = { apiKey, geminiKey, level, style, theme, fontSize }
    localStorage.setItem('fm_settings', JSON.stringify(settings))
    if (onSave) onSave()
    showToast('Settings saved successfully', 'success')
    setTimeout(() => setSaving(false), 800)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) { showToast('Enter an API key first', 'error'); return }
    setTesting(true); setTestResult(null)
    try {
      await testConnection(apiKey.trim())
      setTestResult('success')
      showToast('API connection successful', 'success')
    } catch (e) {
      setTestResult('error')
      showToast('Connection failed — check your API key', 'error')
    } finally {
      setTesting(false)
    }
  }

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) { showToast('Enter a Gemini API key first', 'error'); return }
    setTestingGemini(true); setGeminiResult(null)
    try {
      await testGeminiConnection(geminiKey.trim())
      setGeminiResult('success')
      showToast('Gemini connection successful', 'success')
    } catch (e) {
      setGeminiResult('error')
      showToast('Gemini connection failed — check your API key', 'error')
    } finally {
      setTestingGemini(false)
    }
  }

  const handleExport = () => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('fm_')) data[key] = localStorage.getItem(key)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'financementor_progress.json'; a.click()
    showToast('Progress exported', 'success')
  }

  const handleClearCache = () => {
    if (!confirm('Clear all cached content? This will regenerate concepts on next visit.')) return
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key.startsWith('fm_content_') || key.startsWith('fm_card_')) localStorage.removeItem(key)
    }
    showToast('Content cache cleared', 'info')
  }

  const handleResetProgress = () => {
    if (!confirm('Reset ALL progress? This cannot be undone.')) return
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key.startsWith('fm_') && key !== 'fm_settings') localStorage.removeItem(key)
    }
    showToast('Progress reset', 'info')
  }

  const getCacheStats = () => {
    let concepts = 0, cases = 0, cards = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('fm_content_')) concepts++
      if (key.startsWith('fm_case_')) cases++
      if (key.startsWith('fm_card_')) cards++
    }
    return { concepts, cases, cards }
  }

  const stats = getCacheStats()

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <SectionHeader title="Settings" subtitle="Configure your API key, learning preferences, and display options" />

      {/* API Key */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-accent" />
          <h3 className="font-semibold text-text-primary text-sm">API Configuration</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Claude API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-border text-text-secondary hover:border-accent hover:text-accent transition-all flex items-center gap-1.5"
              >
                {testing ? <span className="animate-spin">⟳</span> : testResult === 'success' ? <Wifi size={13} className="text-positive" /> : <WifiOff size={13} />}
                {testing ? 'Testing...' : 'Test'}
              </button>
            </div>
            {testResult === 'success' && <p className="text-xs text-positive mt-1 flex items-center gap-1"><CheckCircle size={11} /> Connected successfully</p>}
            {testResult === 'error' && <p className="text-xs text-negative mt-1">Connection failed — verify your key at console.anthropic.com</p>}
          </div>
          <div className="bg-bg-secondary rounded-lg p-3 text-xs text-text-secondary space-y-1">
            <p>Get your API key at <span className="text-accent font-mono">console.anthropic.com</span></p>
            <p>New accounts receive ~$5 free credits. No credit card required initially.</p>
            <p className="text-text-muted">Keys are stored only in your browser — never sent anywhere except Anthropic's API.</p>
          </div>
        </div>
      </Card>

      {/* Groq API Key */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-gold" />
          <h3 className="font-semibold text-text-primary text-sm">Groq API — Fast & Free AI</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold block mb-1">Groq API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-border text-text-secondary hover:border-gold hover:text-gold transition-all flex items-center gap-1.5"
              >
                {testingGemini ? <span className="animate-spin">⟳</span> : geminiResult === 'success' ? <Wifi size={13} className="text-positive" /> : <WifiOff size={13} />}
                {testingGemini ? 'Testing...' : 'Test'}
              </button>
            </div>
            {geminiResult === 'success' && <p className="text-xs text-positive mt-1 flex items-center gap-1"><CheckCircle size={11} /> Groq connected successfully</p>}
            {geminiResult === 'error' && <p className="text-xs text-negative mt-1">Connection failed — verify your key at console.groq.com</p>}
          </div>
          <div className="bg-bg-secondary rounded-lg p-3 text-xs text-text-secondary space-y-1">
            <p>Get your free API key at <span className="text-gold font-mono">console.groq.com</span></p>
            <p>Powers all AI features: market data, analysis, concept library, tutor, and more.</p>
            <p className="text-text-muted">Groq is free with generous rate limits (30 req/min). No credit card needed.</p>
          </div>
        </div>
      </Card>

      {/* Learning Profile */}
      <Card>
        <h3 className="font-semibold text-text-primary text-sm mb-4">🎓 Learning Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold">Current Learning Level</label>
            <SelectGroup
              value={level}
              onChange={setLevel}
              options={[
                { value: 'Foundation', label: 'Foundation' },
                { value: 'Core Finance', label: 'Core Finance' },
                { value: 'Advanced', label: 'Advanced' },
                { value: 'Professional', label: 'Professional' },
              ]}
            />
            <p className="text-xs text-text-muted mt-1">This adjusts how AI explanations are pitched — beginner-accessible vs professional-depth.</p>
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold">Teaching Style</label>
            <SelectGroup
              value={style}
              onChange={setStyle}
              options={[
                { value: 'Conceptual First', label: 'Conceptual First' },
                { value: 'Formula Heavy', label: 'Formula Heavy' },
                { value: 'Case-Study Driven', label: 'Case-Study Driven' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Display */}
      <Card>
        <h3 className="font-semibold text-text-primary text-sm mb-4">🎨 Display</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold">Theme</label>
            <SelectGroup
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'dark', label: '🌙 Dark' },
                { value: 'light', label: '☀️ Light' },
                { value: 'bloomberg', label: '📟 Bloomberg' },
              ]}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider font-semibold">Font Size</label>
            <SelectGroup
              value={fontSize}
              onChange={setFontSize}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Content & Data */}
      <Card>
        <h3 className="font-semibold text-text-primary text-sm mb-4">🗄️ Content & Data</h3>
        <div className="bg-bg-secondary rounded-lg p-3 mb-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-accent">{stats.concepts}</p>
            <p className="text-xs text-text-muted">Cached concepts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-gold">{stats.cases}</p>
            <p className="text-xs text-text-muted">Cached cases</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-purple-400">{stats.cards}</p>
            <p className="text-xs text-text-muted">Flashcards</p>
          </div>
        </div>
        <div className="space-y-2">
          <button onClick={handleExport} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:border-accent hover:text-accent transition-all">
            <Download size={14} /> Export My Progress (JSON)
          </button>
          <button onClick={handleClearCache} className="w-full flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:border-gold hover:text-gold transition-all">
            <RotateCcw size={14} /> Clear Cached Content
          </button>
          <button onClick={handleResetProgress} className="w-full flex items-center gap-2 px-4 py-2.5 border border-negative/30 rounded-lg text-sm text-negative/70 hover:border-negative hover:text-negative transition-all">
            <Trash2 size={14} /> Reset All Progress
          </button>
        </div>
      </Card>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-2"
      >
        {saving ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
