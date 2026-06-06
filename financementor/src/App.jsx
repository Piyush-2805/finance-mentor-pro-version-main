import React, { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Layout from './components/layout/Layout.jsx'
import { ToastContainer } from './components/ui/index.jsx'
import Dashboard from './modules/Dashboard.jsx'
import LearningPath from './modules/LearningPath.jsx'
import ConceptLibrary from './modules/ConceptLibrary.jsx'
import Calculators from './modules/Calculators/index.jsx'
import CaseStudies from './modules/CaseStudies.jsx'
import RatioReference from './modules/RatioReference.jsx'
import AITutor from './modules/AITutor.jsx'
import PracticeQuestions from './modules/PracticeQuestions.jsx'
import Flashcards from './modules/Flashcards.jsx'
import Visuals from './modules/Visuals.jsx'
import ExcelModeling from './modules/ExcelModeling.jsx'
import ResearchReports from './modules/ResearchReports.jsx'
import MarketData from './modules/MarketData.jsx'
import Settings from './modules/Settings.jsx'
import { getDueCount } from './utils/sm2.js'
import { getAllConcepts } from './data/curriculum.js'

const getSettings = () => {
  try { return JSON.parse(localStorage.getItem('fm_settings') || '{}') } catch { return {} }
}

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [theme, setTheme] = useState(() => getSettings().theme || 'dark')
  const [hasApiKey, setHasApiKey] = useState(() => !!getSettings().apiKey || !!getSettings().geminiKey)
  const [hasGeminiKey, setHasGeminiKey] = useState(() => !!getSettings().geminiKey)
  const [studySeconds, setStudySeconds] = useState(0)
  const [dueCount, setDueCount] = useState(0)

  useEffect(() => {
    const concepts = getAllConcepts()
    setDueCount(getDueCount(concepts.map(c => c.id)))
  }, [activeModule])

  useEffect(() => {
    const interval = setInterval(() => {
      setStudySeconds(s => {
        const v = s + 1
        localStorage.setItem(`fm_time_${new Date().toDateString()}`, v)
        return v
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const today = new Date().toDateString()
    const last = localStorage.getItem('fm_last_study')
    const streak = parseInt(localStorage.getItem('fm_streak') || '0')
    if (last !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      localStorage.setItem('fm_streak', last === yesterday.toDateString() ? streak + 1 : 1)
      localStorage.setItem('fm_last_study', today)
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '220px')
    if (theme === 'light') {
      document.body.style.background = '#F8FAFC'
      document.body.style.color = '#0F172A'
      document.body.style.fontFamily = '"IBM Plex Sans", sans-serif'
    } else if (theme === 'bloomberg') {
      document.body.style.background = '#0A0A0A'
      document.body.style.color = '#FF8C00'
      document.body.style.fontFamily = '"IBM Plex Mono", monospace'
    } else {
      document.body.style.background = '#030712'
      document.body.style.color = '#F8FAFC'
      document.body.style.fontFamily = '"IBM Plex Sans", sans-serif'
    }
  }, [theme])

  const handleNavigate = (module) => setActiveModule(module)

  const handleThemeChange = (t) => {
    setTheme(t)
    const s = getSettings()
    localStorage.setItem('fm_settings', JSON.stringify({ ...s, theme: t }))
  }

  const handleSettingsChange = () => {
    const s = getSettings()
    setHasApiKey(!!s.apiKey || !!s.geminiKey)
    setHasGeminiKey(!!s.geminiKey)
    setTheme(s.theme || 'dark')
  }

  const props = { onNavigate: handleNavigate, hasApiKey, hasGeminiKey }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':   return <Dashboard {...props} />
      case 'market':      return <MarketData {...props} />
      case 'learning':    return <LearningPath {...props} />
      case 'concepts':    return <ConceptLibrary {...props} />
      case 'calculators': return <Calculators {...props} />
      case 'cases':       return <CaseStudies {...props} />
      case 'ratios':      return <RatioReference {...props} />
      case 'visuals':     return <Visuals {...props} />
      case 'excel':       return <ExcelModeling {...props} />
      case 'research':    return <ResearchReports {...props} />
      case 'tutor':       return <AITutor {...props} />
      case 'practice':    return <PracticeQuestions {...props} />
      case 'flashcards':  return <Flashcards {...props} />
      case 'settings':    return <Settings {...props} onSave={handleSettingsChange} />
      default:            return <Dashboard {...props} />
    }
  }

  return (
    <>
      <Layout
        sidebar={<Sidebar active={activeModule} onNavigate={handleNavigate} dueCount={dueCount} />}
        topbar={<TopBar theme={theme} onThemeChange={handleThemeChange} hasApiKey={hasApiKey} activeModule={activeModule} studyTime={studySeconds} />}
      >
        {!hasApiKey && !hasGeminiKey && activeModule !== 'settings' && (
          <div className="mb-4 flex items-center justify-between bg-gold/10 border border-gold/30 rounded-xl px-4 py-2.5">
            <span className="text-sm text-text-secondary">🔑 Add your Groq API key in Settings to unlock all AI-powered features</span>
            <button onClick={() => handleNavigate('settings')} className="text-xs text-gold font-semibold hover:underline ml-3 flex-shrink-0">
              Open Settings →
            </button>
          </div>
        )}
        {renderModule()}
      </Layout>
      <ToastContainer />
    </>
  )
}
