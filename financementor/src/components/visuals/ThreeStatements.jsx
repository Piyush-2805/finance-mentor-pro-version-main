import React, { useState } from 'react'

const IS_ITEMS = [
  { label: 'Revenue', key: 'revenue', note: 'Total sales' },
  { label: '− Cost of Goods Sold', key: 'cogs', note: 'Direct costs' },
  { label: '= Gross Profit', key: 'grossprofit', bold: true },
  { label: '− Operating Expenses', key: 'opex', note: 'SG&A, R&D' },
  { label: '− Depreciation (D&A)', key: 'da', note: 'Non-cash charge', link: 'cf_da' },
  { label: '= EBIT', key: 'ebit', bold: true },
  { label: '− Interest Expense', key: 'interest', note: 'On debt', link: 'bs_debt' },
  { label: '− Tax', key: 'tax' },
  { label: '= Net Income', key: 'netincome', bold: true, link: 'bs_re', highlight: true },
]

const BS_ITEMS = [
  { label: 'ASSETS', section: true },
  { label: 'Cash & Equivalents', key: 'bs_cash', link: 'cf_cash', note: 'From CF statement' },
  { label: 'Accounts Receivable', key: 'bs_ar' },
  { label: 'Inventory', key: 'bs_inv' },
  { label: 'PP&E (net of D&A)', key: 'bs_ppe', link: 'da' },
  { label: 'Goodwill & Intangibles', key: 'bs_goodwill' },
  { label: 'LIABILITIES', section: true },
  { label: 'Accounts Payable', key: 'bs_ap' },
  { label: 'Short-Term Debt', key: 'bs_std' },
  { label: 'Long-Term Debt', key: 'bs_debt', link: 'interest' },
  { label: 'EQUITY', section: true },
  { label: 'Share Capital', key: 'bs_sc' },
  { label: 'Retained Earnings', key: 'bs_re', link: 'netincome', note: '← Flows from IS', highlight: true },
]

const CF_ITEMS = [
  { label: 'OPERATING', section: true },
  { label: 'Net Income', key: 'cf_ni', link: 'netincome', note: 'From IS', highlight: true },
  { label: '+ Depreciation', key: 'cf_da', link: 'da', note: 'Non-cash add-back' },
  { label: '± Changes in Working Capital', key: 'cf_nwc' },
  { label: '= Cash from Operations (CFO)', key: 'cfo', bold: true },
  { label: 'INVESTING', section: true },
  { label: '− Capital Expenditures', key: 'capex', note: 'Grows PP&E' },
  { label: '± Acquisitions / Disposals', key: 'acq' },
  { label: '= Cash from Investing (CFI)', key: 'cfi', bold: true },
  { label: 'FINANCING', section: true },
  { label: '+ Debt Issued / (Repaid)', key: 'debt_cf', link: 'bs_debt' },
  { label: '− Dividends Paid', key: 'div' },
  { label: '= Cash from Financing (CFF)', key: 'cff', bold: true },
  { label: 'Ending Cash Balance', key: 'cf_cash', link: 'bs_cash', note: '→ To Balance Sheet', highlight: true, bold: true },
]

const CONNECTIONS = [
  { from: 'netincome', to: 'bs_re', color: '#3B82F6', label: 'Net Income → Retained Earnings' },
  { from: 'netincome', to: 'cf_ni', color: '#8B5CF6', label: 'Net Income → CF Statement' },
  { from: 'da', to: 'cf_da', color: '#F59E0B', label: 'D&A → Non-cash add-back' },
  { from: 'cf_cash', to: 'bs_cash', color: '#22C55E', label: 'Ending Cash → Balance Sheet' },
]

export default function ThreeStatements() {
  const [hovered, setHovered] = useState(null)
  const [activeConnection, setActiveConnection] = useState(null)

  const isHighlighted = (key) => {
    if (!activeConnection) return hovered === key
    return activeConnection.from === key || activeConnection.to === key
  }

  const StmtItem = ({ item }) => {
    const highlighted = isHighlighted(item.key)
    const hasLink = !!item.link
    const conn = CONNECTIONS.find(c => c.from === item.key || c.to === item.key)

    return (
      <div
        onMouseEnter={() => { setHovered(item.key); if (conn) setActiveConnection(conn) }}
        onMouseLeave={() => { setHovered(null); setActiveConnection(null) }}
        className={`px-2 py-1 rounded-lg transition-all text-xs cursor-default ${
          item.section ? 'font-bold text-text-muted uppercase tracking-wider text-xs pt-3 pb-1' :
          highlighted ? 'bg-accent/20 text-accent' :
          item.highlight ? 'bg-gold/10 text-gold font-semibold' :
          item.bold ? 'font-semibold text-text-primary' :
          'text-text-secondary'
        } ${hasLink ? 'cursor-pointer' : ''}`}
      >
        {!item.section && (
          <div className="flex items-start justify-between gap-1">
            <span>{item.label}</span>
            {item.note && <span className="text-xs text-text-muted italic flex-shrink-0 ml-1">{item.note}</span>}
          </div>
        )}
        {item.section && item.label}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active connection banner */}
      {activeConnection && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-2 text-xs text-accent font-semibold animate-fade-in">
          🔗 {activeConnection.label}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {/* Income Statement */}
        <div className="bg-bg-card border border-accent/30 rounded-xl p-3">
          <div className="text-center mb-3 pb-2 border-b border-border">
            <p className="text-xs font-bold text-accent uppercase tracking-wider">📋 Income Statement</p>
            <p className="text-xs text-text-muted mt-0.5">Period: Jan–Dec 20XX</p>
          </div>
          {IS_ITEMS.map((item, i) => <StmtItem key={i} item={item} />)}
        </div>

        {/* Balance Sheet */}
        <div className="bg-bg-card border border-positive/30 rounded-xl p-3">
          <div className="text-center mb-3 pb-2 border-b border-border">
            <p className="text-xs font-bold text-positive uppercase tracking-wider">🏛 Balance Sheet</p>
            <p className="text-xs text-text-muted mt-0.5">As of Dec 31, 20XX</p>
          </div>
          {BS_ITEMS.map((item, i) => <StmtItem key={i} item={item} />)}
        </div>

        {/* Cash Flow */}
        <div className="bg-bg-card border border-gold/30 rounded-xl p-3">
          <div className="text-center mb-3 pb-2 border-b border-border">
            <p className="text-xs font-bold text-gold uppercase tracking-wider">💰 Cash Flow Statement</p>
            <p className="text-xs text-text-muted mt-0.5">Period: Jan–Dec 20XX</p>
          </div>
          {CF_ITEMS.map((item, i) => <StmtItem key={i} item={item} />)}
        </div>
      </div>

      {/* Connection legend */}
      <div className="bg-bg-secondary rounded-xl p-3">
        <p className="text-xs font-semibold text-text-muted mb-2">Key Connections — hover any highlighted item to see the link</p>
        <div className="flex flex-wrap gap-3">
          {CONNECTIONS.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-4 h-1 rounded-full" style={{ background: c.color }} />
              <span className="text-xs text-text-muted">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
