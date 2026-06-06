import React, { useState } from 'react'
import { Card, Badge, SectionHeader, FormulaBox } from '../components/ui/index.jsx'
import { getCachedContent, callClaude } from '../utils/claude.js'
import { ChevronDown, ChevronRight, ExternalLink, Play } from 'lucide-react'

const SYSTEM_PROMPT = `You are a Goldman Sachs investment banking analyst teaching Excel financial modeling. You teach with exact Excel formulas, real model structures, and practical tips from actual deal work. Always show specific Excel syntax where relevant.`

const MODULES = [
  {
    id: 'foundations',
    title: 'Excel Foundations for Finance',
    emoji: '📐',
    level: 'Foundation',
    duration: '2 hrs',
    lessons: [
      { id: 'setup', title: 'Setting Up a Financial Model — Best Practices', desc: 'Color coding, structure, assumptions section, hardcoded vs formula cells' },
      { id: 'formulas', title: 'Essential Excel Formulas Every Analyst Uses', desc: 'IF, SUMIF, VLOOKUP, INDEX/MATCH, IFERROR, ROUND, TEXT' },
      { id: 'shortcuts', title: 'Excel Keyboard Shortcuts That Save Hours', desc: 'Navigation, formatting, auditing — the ones actually used in investment banking' },
      { id: 'formatting', title: 'Professional Model Formatting', desc: 'Number formats, borders, headers, print setup for client-ready output' },
    ]
  },
  {
    id: 'three_statement',
    title: 'Three-Statement Model',
    emoji: '🔗',
    level: 'Core',
    duration: '4 hrs',
    lessons: [
      { id: 'is_build', title: 'Building the Income Statement', desc: 'Revenue drivers, margin assumptions, EBIT, EBITDA — line by line' },
      { id: 'bs_build', title: 'Building the Balance Sheet', desc: 'Working capital, PP&E schedule, debt schedule, equity roll-forward' },
      { id: 'cf_build', title: 'Building the Cash Flow Statement', desc: 'Indirect method, linking to IS and BS, free cash flow derivation' },
      { id: 'linking', title: 'Linking All Three Statements', desc: 'Net income → retained earnings, ending cash → balance sheet, the circular reference problem' },
      { id: 'checks', title: 'Model Checks and Error Proofing', desc: 'Balance check, cash flow check, audit tools, common errors and how to fix them' },
    ]
  },
  {
    id: 'dcf_model',
    title: 'DCF Model in Excel',
    emoji: '📊',
    level: 'Core',
    duration: '3 hrs',
    lessons: [
      { id: 'revenue_proj', title: 'Revenue and EBITDA Projections', desc: 'Building a driver-based projection model, growth assumptions, margin analysis' },
      { id: 'fcf_calc', title: 'Free Cash Flow Calculation in Excel', desc: 'NOPAT, D&A add-back, capex, working capital — exact Excel formulas' },
      { id: 'wacc_calc', title: 'WACC Calculation in Excel', desc: 'CAPM inputs, beta lookup, capital structure weights, building a WACC tab' },
      { id: 'terminal_value', title: 'Terminal Value and Discounting', desc: 'Gordon Growth and exit multiple methods, NPV function, mid-year convention' },
      { id: 'sensitivity', title: 'Sensitivity Tables with Data Tables', desc: 'Two-variable data table, WACC vs growth, formatting as a heatmap' },
    ]
  },
  {
    id: 'comps',
    title: 'Comparable Company Analysis',
    emoji: '🔍',
    level: 'Core',
    duration: '2 hrs',
    lessons: [
      { id: 'comps_setup', title: 'Setting Up a Comps Table', desc: 'Peer selection criteria, data sources, spreading financials from filings' },
      { id: 'multiples', title: 'Calculating Trading Multiples', desc: 'EV/EBITDA, EV/Revenue, P/E, EV/EBIT — exact formulas and bridge calculations' },
      { id: 'football_field', title: 'Building a Football Field Chart', desc: 'Bar chart showing valuation range from each method — the standard pitch book format' },
    ]
  },
  {
    id: 'lbo_model',
    title: 'LBO Model in Excel',
    emoji: '🏦',
    level: 'Advanced',
    duration: '5 hrs',
    lessons: [
      { id: 'sources_uses', title: 'Sources and Uses of Funds', desc: 'Acquisition price, transaction fees, debt structure, equity check — the entry table' },
      { id: 'debt_schedule', title: 'Debt Schedule and Cash Sweep', desc: 'Mandatory amortization, cash sweep, PIK toggle, revolver — modeling each tranche' },
      { id: 'lbo_is', title: 'LBO Income Statement and Cash Flows', desc: 'Interest expense linkage, tax shield, free cash flow to debt service' },
      { id: 'returns', title: 'Returns Analysis: IRR and MOIC', desc: 'Exit assumptions, equity proceeds, IRR function, returns bridge waterfall' },
      { id: 'lbo_sensitivity', title: 'LBO Sensitivity Analysis', desc: 'Entry multiple vs exit multiple table, leverage vs IRR, operating scenario analysis' },
    ]
  },
  {
    id: 'ma_model',
    title: 'M&A Accretion / Dilution Model',
    emoji: '🤝',
    level: 'Advanced',
    duration: '3 hrs',
    lessons: [
      { id: 'deal_structure', title: 'Modelling Deal Consideration', desc: 'All-cash, all-stock, mixed — share issuance, new debt, purchase price allocation' },
      { id: 'ppa', title: 'Purchase Price Allocation and Goodwill', desc: 'Writing up assets, deferred tax liability, goodwill calculation' },
      { id: 'accretion', title: 'Accretion / Dilution Analysis', desc: 'Pro forma EPS, synergy assumptions, contribution analysis — does the deal make sense?' },
    ]
  },
]

const EXCEL_TIPS = [
  { tip: 'Color code everything', detail: 'Blue = hardcoded inputs. Black = formulas. Green = links from other sheets. This is Goldman Sachs standard. Anyone can audit your model instantly.' },
  { tip: 'Never hardcode a number inside a formula', detail: '=B5*0.25 is wrong. =B5*tax_rate is right. Every assumption lives in an assumptions section. Never buried in a formula.' },
  { tip: 'Build one scenario first, then sensitize', detail: 'Build your base case completely. Then create a scenario toggle that switches assumptions. Never build multiple separate columns for scenarios.' },
  { tip: 'F2 shows you what a cell references', detail: 'Press F2 on any cell to see exactly what it links to. Ctrl+[ jumps to the source cell. These two shortcuts save hours of auditing.' },
  { tip: 'Circular references are not always wrong', detail: 'Three-statement models have intentional circular references (interest expense depends on debt, debt depends on cash, cash depends on interest). Use iterative calculation in Excel settings.' },
  { tip: 'Check your model with a plug', detail: 'Add a balance check cell: =Total Assets - Total Liabilities - Total Equity. If it shows anything other than zero, your model has an error. Never submit until this reads zero.' },
]

function LessonDetail({ lesson, moduleTitle, hasApiKey, onNavigate }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    if (!hasApiKey) { onNavigate('settings'); return }
    setLoading(true); setError(null)
    try {
      const data = await getCachedContent(
        `excel_${lesson.id}`,
        SYSTEM_PROMPT,
        `Teach this Excel financial modeling lesson: "${lesson.title}" (from module: ${moduleTitle})

Return ONLY valid JSON:
{
  "overview": "what this lesson covers and why it matters in real deal work",
  "key_concepts": ["concept 1", "concept 2", "concept 3"],
  "excel_formulas": [
    {"formula": "=NPV(rate, value1, value2...)", "use": "what it does", "example": "=NPV(B5/4, C10:G10) — quarterly discount rate, 5 years of FCFs"}
  ],
  "step_by_step": ["step 1 with exact Excel instructions", "step 2", "step 3", "step 4", "step 5"],
  "real_world_application": "how this exact skill was used in a real deal — name the deal, the bank, and what the analyst did",
  "common_mistakes": ["mistake 1 and how to fix it", "mistake 2"],
  "pro_tips": ["tip from actual IB analysts", "tip 2"],
  "practice_exercise": "a specific exercise to practice this skill with exact numbers to use"
}`,
        1500
      )
      setContent(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!content && !loading) return (
    <div className="mt-3">
      <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold hover:bg-accent-hover transition-all">
        <Play size={12} /> Load Lesson
      </button>
    </div>
  )

  if (loading) return <div className="mt-3 space-y-2"><div className="skeleton h-4 rounded" /><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-20 rounded-xl" /></div>

  if (error) return <p className="text-xs text-negative mt-2">Failed to load. <button onClick={load} className="text-accent hover:underline">Retry</button></p>

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Overview</p>
        <p className="text-xs text-text-secondary leading-relaxed">{content.overview}</p>
      </div>

      {content.excel_formulas?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Excel Formulas Used</p>
          <div className="space-y-2">
            {content.excel_formulas.map((f, i) => (
              <div key={i} className="bg-bg-secondary rounded-xl p-3">
                <code className="text-gold font-mono text-xs font-bold block mb-1">{f.formula}</code>
                <p className="text-xs text-text-secondary mb-1">{f.use}</p>
                <p className="text-xs text-text-muted italic">{f.example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.step_by_step?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Step by Step</p>
          <div className="space-y-2">
            {content.step_by_step.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-xs text-text-secondary leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.real_world_application && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">Real Deal Application</p>
          <p className="text-xs text-text-secondary leading-relaxed">{content.real_world_application}</p>
        </div>
      )}

      {content.common_mistakes?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-negative uppercase tracking-wider mb-2">Common Mistakes</p>
          {content.common_mistakes.map((m, i) => (
            <p key={i} className="text-xs text-text-secondary mb-1 flex gap-1.5"><span className="text-negative">✗</span>{m}</p>
          ))}
        </div>
      )}

      {content.practice_exercise && (
        <div className="bg-positive/5 border border-positive/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-positive uppercase tracking-wider mb-1">Practice Exercise</p>
          <p className="text-xs text-text-secondary leading-relaxed">{content.practice_exercise}</p>
        </div>
      )}
    </div>
  )
}

function ModuleSection({ module, hasApiKey, onNavigate }) {
  const [expanded, setExpanded] = useState(false)
  const [activeLesson, setActiveLesson] = useState(null)

  const LEVEL_COLORS = { Foundation: 'foundation', Core: 'cfa1', Advanced: 'cfa2' }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className="text-xl">{module.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary text-sm">{module.title}</span>
            <Badge variant={LEVEL_COLORS[module.level] || 'gray'}>{module.level}</Badge>
          </div>
          <p className="text-xs text-text-muted">{module.lessons.length} lessons · {module.duration}</p>
        </div>
        {expanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
      </div>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4 space-y-2">
          {module.lessons.map(lesson => (
            <div key={lesson.id}>
              <button
                onClick={() => setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                  activeLesson === lesson.id ? 'bg-accent/10 border border-accent/30' : 'hover:bg-bg-hover border border-transparent'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${activeLesson === lesson.id ? 'border-accent bg-accent/20' : 'border-border'}`} />
                <div>
                  <p className={`text-xs font-semibold ${activeLesson === lesson.id ? 'text-accent' : 'text-text-primary'}`}>{lesson.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{lesson.desc}</p>
                </div>
              </button>
              {activeLesson === lesson.id && (
                <div className="px-3 pb-3">
                  <LessonDetail lesson={lesson} moduleTitle={module.title} hasApiKey={hasApiKey} onNavigate={onNavigate} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function ExcelModeling({ hasApiKey, onNavigate }) {
  return (
    <div className="animate-fade-in max-w-3xl">
      <SectionHeader
        title="Excel Financial Modeling"
        subtitle="Build real models from scratch — the way investment bankers actually do it"
      />

      <div className="bg-gold/5 border border-gold/30 rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-gold mb-2">Why Excel modeling matters</p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Every concept you learn in the Concept Library becomes truly usable when you can build it in Excel.
          A DCF you can explain is good. A DCF you can build from a blank spreadsheet in 90 minutes is what
          gets you hired. This module teaches you to build the models investment banks actually use —
          three-statement models, DCF, LBO, comps, and M&A accretion/dilution.
        </p>
      </div>

      {/* Pro tips strip */}
      <div className="mb-6">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Analyst Pro Tips — Before You Start</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXCEL_TIPS.map((tip, i) => (
            <div key={i} className="bg-bg-secondary border border-border rounded-xl p-3">
              <p className="text-xs font-bold text-text-primary mb-1">{tip.tip}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{tip.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {MODULES.map(module => (
          <ModuleSection key={module.id} module={module} hasApiKey={hasApiKey} onNavigate={onNavigate} />
        ))}
      </div>

      {/* External resources */}
      <Card className="mt-6">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Recommended External Practice</p>
        <div className="space-y-2">
          {[
            { name: 'CFI Free Excel Course', url: 'corporatefinanceinstitute.com', desc: 'Free Excel for finance fundamentals' },
            { name: 'Breaking Into Wall Street', url: 'breakingintowallstreet.com', desc: 'Industry standard IB modeling courses' },
            { name: 'Macabacus', url: 'macabacus.com', desc: 'Free Excel add-in used by investment banks' },
            { name: 'Wall Street Prep', url: 'wallstreetprep.com', desc: 'Used by Goldman Sachs, Morgan Stanley for analyst training' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl">
              <div>
                <p className="text-xs font-semibold text-text-primary">{r.name}</p>
                <p className="text-xs text-text-muted">{r.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-accent font-mono">
                {r.url} <ExternalLink size={10} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
