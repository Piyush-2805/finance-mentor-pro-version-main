import React, { useState } from 'react'
import { Card, Badge, SectionHeader } from '../components/ui/index.jsx'
import { getCachedContent } from '../utils/claude.js'
import { ChevronDown, ChevronRight, Play, FileText } from 'lucide-react'

const SYSTEM_PROMPT = `You are a senior equity research analyst at Morgan Stanley who has written hundreds of research reports. You teach people how to read, interpret, and extract value from professional investment research. Be specific, practical, and use real examples from actual published research.`

const REPORT_SECTIONS = [
  {
    id: 'rating',
    label: 'Rating & Price Target',
    color: '#3B82F6',
    position: 'Top right of cover page',
    what: 'Buy / Overweight / Hold / Sell + 12-month price target',
    how_to_read: 'Compare price target to current price — the implied upside/downside is more informative than the rating alone. A Buy with 5% upside is weaker than a Hold with 15% upside.',
    red_flag: 'Rating and price target moving in opposite directions from prior report',
  },
  {
    id: 'thesis',
    label: 'Investment Thesis',
    color: '#8B5CF6',
    position: 'First paragraph — the most important section',
    what: 'Why the analyst thinks this stock will outperform or underperform',
    how_to_read: 'Look for 2–3 specific, testable claims. Vague theses ("strong management team") are worth less than specific ones ("margin expansion from supply chain restructuring will add 200bps by FY25").',
    red_flag: 'Thesis that simply says the stock is "cheap" without explaining why it is cheap relative to the business quality',
  },
  {
    id: 'catalysts',
    label: 'Key Catalysts',
    color: '#22C55E',
    position: 'Usually a bullet list near the top',
    what: 'Specific upcoming events that should move the stock — earnings, product launches, regulatory decisions',
    how_to_read: 'Each catalyst should have a timeline and an expected impact. A catalyst without a timeline is not really a catalyst.',
    red_flag: 'All catalysts are long-dated (2+ years out) — analyst has no near-term conviction',
  },
  {
    id: 'financials',
    label: 'Financial Summary Table',
    color: '#F59E0B',
    position: 'Page 2–3, a dense table',
    what: 'Revenue, EBITDA, EPS estimates for next 3–5 years vs consensus',
    how_to_read: 'The gap between the analyst\'s estimates and consensus is the signal. If the analyst is 15% above consensus on 2025 EPS and has a Buy, they believe the market is missing something specific.',
    red_flag: 'Analyst estimates exactly match consensus — no differentiated view, report has low information value',
  },
  {
    id: 'valuation',
    label: 'Valuation Section',
    color: '#EF4444',
    position: 'Middle of report',
    what: 'How the analyst arrives at the price target — DCF, comps, or both',
    how_to_read: 'For DCF: check the WACC and terminal growth rate. Small changes here drive huge price target differences. For comps: check which peers were selected and whether the multiple premium/discount is justified.',
    red_flag: 'Price target derived from a single methodology — professional analysts always triangulate with at least two methods',
  },
  {
    id: 'risks',
    label: 'Risks Section',
    color: '#64748B',
    position: 'Near the end — often skipped, should not be',
    what: 'What would make the thesis wrong',
    how_to_read: 'The risks section is where honest analysts reveal their doubts. Read it as carefully as the thesis. If the risk section is longer than the investment thesis, that is a signal.',
    red_flag: 'Generic risks ("competition may intensify") rather than company-specific risks',
  },
]

const REPORT_TYPES = [
  {
    id: 'initiation',
    title: 'Initiation of Coverage',
    badge: 'Initiation',
    length: '40–80 pages',
    when: 'First time an analyst covers a company',
    what_it_contains: 'Deep industry analysis, full financial model, comprehensive risk assessment, detailed competitive positioning',
    how_to_use: 'Read the full report. This is the analyst\'s most thorough work and sets the baseline for all future updates. Pay special attention to the bull/bear case scenarios.',
    real_example: 'When Goldman Sachs initiated coverage on Nvidia in 2020, their initiation report included a detailed data center TAM analysis that became the framework the entire street used to value AI infrastructure plays.',
  },
  {
    id: 'earnings_update',
    title: 'Earnings Update',
    badge: 'Earnings',
    length: '3–8 pages',
    when: 'After quarterly earnings release',
    what_it_contains: 'Actual vs estimate comparison, revised financial model, updated price target if any change',
    how_to_use: 'Focus on estimate revisions and tone change vs prior quarter. A flat price target but rising estimates = analyst becoming more cautious on multiple. An unchanged rating with significantly cut estimates = analyst losing conviction.',
    real_example: 'After Meta\'s Q3 2022 earnings when Zuckerberg doubled down on metaverse spending, most analysts maintained their ratings but cut price targets by 20–40%. The estimate cuts told the real story before the ratings moved.',
  },
  {
    id: 'sector_note',
    title: 'Industry / Sector Note',
    badge: 'Sector',
    length: '10–30 pages',
    when: 'Major industry development, regulatory change, macro shift',
    what_it_contains: 'Industry-wide analysis, relative preferences among covered stocks, thematic investment framework',
    how_to_use: 'Read to understand how the analyst thinks about relative value within a sector. The pecking order of their stock preferences is more useful than individual ratings.',
    real_example: 'Morgan Stanley\'s semiconductor sector notes ahead of the 2022 chip cycle downturn changed their pecking order — moving fabless designers below foundries — which predicted the relative performance of NVIDIA vs TSMC correctly for the next 12 months.',
  },
  {
    id: 'model_update',
    title: 'Estimate Change / Model Update',
    badge: 'Update',
    length: '2–5 pages',
    when: 'After a significant data point — competitor earnings, channel checks, macro shift',
    what_it_contains: 'Revised estimates with explanation, updated price target, maintained or changed rating',
    how_to_use: 'Track the direction and magnitude of estimate revisions over time. Serial estimate cuts with a maintained Buy rating is a sell signal.',
    real_example: 'JP Morgan\'s model updates on Boeing during the 737 MAX crisis showed 8 consecutive quarterly estimate reductions while maintaining an Overweight — a classic case of anchoring bias that cost investors who followed the rating rather than the estimate trend.',
  },
]

const ANNOTATION_GUIDE = [
  { symbol: 'E', meaning: 'Estimate — analyst\'s own projection, not reported actuals' },
  { symbol: 'cons.', meaning: 'Consensus — average of all analyst estimates for this metric' },
  { symbol: 'NM', meaning: 'Not Meaningful — usually when a metric is negative or undefined (e.g. P/E when EPS is negative)' },
  { symbol: 'LTM', meaning: 'Last Twelve Months — trailing 12-month figure, more current than last full year' },
  { symbol: 'NTM', meaning: 'Next Twelve Months — forward 12-month estimate, used in forward multiples' },
  { symbol: 'OW / EW / UW', meaning: 'Overweight / Equal Weight / Underweight — Morgan Stanley\'s buy/hold/sell terminology' },
  { symbol: 'PT / TP', meaning: 'Price Target / Target Price — analyst\'s 12-month price objective' },
  { symbol: 'SOTP', meaning: 'Sum-of-the-Parts — valuation method that values each business segment separately' },
  { symbol: 'Bull / Base / Bear', meaning: 'Three scenario analysis — optimistic, central, and pessimistic cases with separate price targets' },
]

function SectionCard({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{ borderColor: open ? section.color + '66' : '#334155' }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: section.color }} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">{section.label}</p>
          <p className="text-xs text-text-muted">{section.position}</p>
        </div>
        {open ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase mb-1">What it contains</p>
            <p className="text-xs text-text-secondary">{section.what}</p>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-accent uppercase mb-1">How to read it</p>
            <p className="text-xs text-text-secondary leading-relaxed">{section.how_to_read}</p>
          </div>
          <div className="bg-negative/5 border border-negative/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-negative uppercase mb-1">Red flag to watch for</p>
            <p className="text-xs text-text-secondary">{section.red_flag}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportTypeCard({ report }) {
  const [open, setOpen] = useState(false)
  return (
    <Card hover onClick={() => setOpen(!open)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="blue">{report.badge}</Badge>
            <span className="font-semibold text-text-primary text-sm">{report.title}</span>
          </div>
          <div className="flex gap-3 text-xs text-text-muted">
            <span>📄 {report.length}</span>
            <span>⏱ {report.when}</span>
          </div>
        </div>
        {open ? <ChevronDown size={14} className="text-text-muted flex-shrink-0 mt-1" /> : <ChevronRight size={14} className="text-text-muted flex-shrink-0 mt-1" />}
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-border space-y-3 animate-fade-in">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase mb-1">Contains</p>
            <p className="text-xs text-text-secondary">{report.what_it_contains}</p>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-accent uppercase mb-1">How to use it</p>
            <p className="text-xs text-text-secondary leading-relaxed">{report.how_to_use}</p>
          </div>
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-gold uppercase mb-1">Real example</p>
            <p className="text-xs text-text-secondary leading-relaxed">{report.real_example}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

function AIAnalysis({ hasApiKey, onNavigate }) {
  const [company, setCompany] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!hasApiKey) { onNavigate('settings'); return }
    if (!company.trim()) return
    setLoading(true); setAnalysis(null)
    try {
      const data = await getCachedContent(
        `report_analysis_${company.toLowerCase().replace(/\s+/g, '_')}`,
        SYSTEM_PROMPT,
        `Simulate a professional equity research report summary for: ${company}

Return ONLY valid JSON:
{
  "company": "${company}",
  "rating": "Buy|Hold|Sell|Overweight|Underweight",
  "price_target": "a realistic price target with $ sign",
  "current_price": "approximate current price",
  "implied_upside": "percentage upside/downside",
  "investment_thesis": "3-4 sentence compelling investment thesis as a Goldman Sachs analyst would write it",
  "key_catalysts": [{"catalyst": "specific event", "timeline": "Q1 2025 etc", "impact": "what it means for the stock"}],
  "bull_case": {"price_target": "$X", "scenario": "what has to go right"},
  "bear_case": {"price_target": "$X", "scenario": "what could go wrong"},
  "key_metrics": [{"metric": "metric name", "value": "value", "vs_consensus": "above/below/in-line"}],
  "valuation": "how the analyst values this company — which multiple, what peers, why the premium or discount",
  "top_risks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "one_line_summary": "if you had to tell a portfolio manager in one sentence why to buy or avoid this stock"
}`,
        1500
      )
      setAnalysis(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Practice Reading — AI-Simulated Report</p>
      <div className="flex gap-2 mb-4">
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="Enter any company (e.g. Apple, HDFC Bank, Reliance, Tesla...)"
          className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={generate}
          disabled={loading || !company.trim()}
          className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover disabled:opacity-40 transition-all flex items-center gap-2"
        >
          {loading ? <span className="animate-spin">⟳</span> : <Play size={14} />}
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-display font-bold text-xl text-text-primary">{analysis.company}</span>
                  <Badge variant={analysis.rating === 'Buy' || analysis.rating === 'Overweight' ? 'green' : analysis.rating === 'Sell' || analysis.rating === 'Underweight' ? 'red' : 'gray'}>
                    {analysis.rating}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">Simulated Goldman Sachs Equity Research</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-accent">{analysis.price_target}</p>
                <p className="text-xs text-text-muted">12-month price target</p>
                <p className={`text-sm font-semibold mt-0.5 ${analysis.implied_upside?.startsWith('+') ? 'text-positive' : 'text-negative'}`}>
                  {analysis.implied_upside} upside
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-1">One-Line Summary</p>
              <p className="text-sm font-medium text-text-primary italic">"{analysis.one_line_summary}"</p>
            </div>
          </div>

          {/* Investment Thesis */}
          <Card>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Investment Thesis</p>
            <p className="text-sm text-text-secondary leading-relaxed">{analysis.investment_thesis}</p>
          </Card>

          {/* Catalysts */}
          {analysis.key_catalysts?.length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Key Catalysts</p>
              <div className="space-y-2">
                {analysis.key_catalysts.map((c, i) => (
                  <div key={i} className="flex gap-3 items-start bg-bg-secondary rounded-lg p-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{c.catalyst}</p>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs font-mono text-text-muted">{c.timeline}</span>
                        <span className="text-xs text-text-secondary">{c.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bull / Bear */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-positive/5 border border-positive/30 rounded-xl p-4">
              <p className="text-xs font-bold text-positive mb-1">Bull Case</p>
              <p className="font-mono text-lg font-bold text-positive mb-1">{analysis.bull_case?.price_target}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{analysis.bull_case?.scenario}</p>
            </div>
            <div className="bg-negative/5 border border-negative/30 rounded-xl p-4">
              <p className="text-xs font-bold text-negative mb-1">Bear Case</p>
              <p className="font-mono text-lg font-bold text-negative mb-1">{analysis.bear_case?.price_target}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{analysis.bear_case?.scenario}</p>
            </div>
          </div>

          {/* Valuation */}
          <Card>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Valuation Approach</p>
            <p className="text-xs text-text-secondary leading-relaxed">{analysis.valuation}</p>
          </Card>

          {/* Risks */}
          {analysis.top_risks?.length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-negative uppercase tracking-wider mb-2">Key Risks</p>
              {analysis.top_risks.map((r, i) => (
                <p key={i} className="text-xs text-text-secondary mb-1.5 flex gap-2">
                  <span className="text-negative flex-shrink-0">⚠</span>{r}
                </p>
              ))}
            </Card>
          )}

          <div className="bg-bg-secondary rounded-xl p-3">
            <p className="text-xs text-text-muted">This is an AI-simulated report for educational purposes. It uses the same analytical framework as real investment banks but is not based on current market data. Use it to practice reading and interpreting research reports.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResearchReports({ hasApiKey, onNavigate }) {
  const [activeTab, setActiveTab] = useState('anatomy')

  const TABS = [
    { id: 'anatomy', label: 'Report Anatomy' },
    { id: 'types', label: 'Report Types' },
    { id: 'terminology', label: 'Terminology' },
    { id: 'practice', label: 'Practice Reading' },
  ]

  return (
    <div className="animate-fade-in max-w-3xl">
      <SectionHeader
        title="Reading Research Reports"
        subtitle="How to extract maximum value from Goldman Sachs, Morgan Stanley, and JP Morgan research"
      />

      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-accent mb-2">Why this skill matters</p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Research reports are how Wall Street communicates its views. Every portfolio manager, analyst,
          and serious investor reads them daily. Knowing how to extract the signal from the noise —
          which sections matter, what the terminology means, when a Buy rating is actually a Hold —
          is a core professional skill that separates informed investors from everyone else.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'anatomy' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted mb-4">Every professional research report follows a standard structure. Click each section to learn what to look for and what red flags to watch.</p>
          {REPORT_SECTIONS.map(section => <SectionCard key={section.id} section={section} />)}
        </div>
      )}

      {activeTab === 'types' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted mb-4">Different reports serve different purposes. Knowing which type you are reading changes how you should interpret it.</p>
          {REPORT_TYPES.map(report => <ReportTypeCard key={report.id} report={report} />)}
        </div>
      )}

      {activeTab === 'terminology' && (
        <div>
          <p className="text-xs text-text-muted mb-4">Research reports use abbreviations and terminology that are not obvious. These are the ones that appear in almost every report.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ANNOTATION_GUIDE.map((item, i) => (
              <div key={i} className="bg-bg-secondary border border-border rounded-xl p-3 flex gap-3">
                <code className="font-mono text-gold font-bold text-xs w-16 flex-shrink-0 mt-0.5">{item.symbol}</code>
                <p className="text-xs text-text-secondary leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>
          <Card className="mt-4">
            <p className="text-xs font-bold text-gold mb-3">Rating Terminology Across Banks</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-text-muted">Signal</th>
                    <th className="text-left py-2 pr-4 text-text-muted">Goldman Sachs</th>
                    <th className="text-left py-2 pr-4 text-text-muted">Morgan Stanley</th>
                    <th className="text-left py-2 text-text-muted">JP Morgan</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bullish', 'Buy', 'Overweight', 'Overweight'],
                    ['Neutral', 'Neutral', 'Equal-weight', 'Neutral'],
                    ['Bearish', 'Sell', 'Underweight', 'Underweight'],
                  ].map(([signal, gs, ms, jpm]) => (
                    <tr key={signal} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-semibold text-text-muted">{signal}</td>
                      <td className={`py-2 pr-4 font-semibold ${signal === 'Bullish' ? 'text-positive' : signal === 'Bearish' ? 'text-negative' : 'text-text-secondary'}`}>{gs}</td>
                      <td className={`py-2 pr-4 font-semibold ${signal === 'Bullish' ? 'text-positive' : signal === 'Bearish' ? 'text-negative' : 'text-text-secondary'}`}>{ms}</td>
                      <td className={`py-2 font-semibold ${signal === 'Bullish' ? 'text-positive' : signal === 'Bearish' ? 'text-negative' : 'text-text-secondary'}`}>{jpm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted mt-2">Important: A "Neutral" from Goldman Sachs carries more information than it appears. Their analysts rarely issue Sells, so Neutral is often effectively negative.</p>
          </Card>
        </div>
      )}

      {activeTab === 'practice' && (
        <AIAnalysis hasApiKey={hasApiKey} onNavigate={onNavigate} />
      )}
    </div>
  )
}
