// Complete CFA Curriculum mapped as learning tracks

export const TRACKS = {
  foundation: {
    id: 'foundation',
    label: 'Foundation',
    icon: '🏗️',
    color: '#22C55E',
    description: 'Core financial literacy before diving into professional-level analysis',
    modules: [
      {
        id: 'f1',
        title: 'How Financial Markets Work',
        hours: 2,
        topics: [
          'What markets are and why they exist',
          'Equity, debt, derivatives, FX, and commodity markets',
          'Primary vs secondary markets',
          'Market participants: issuers, investors, intermediaries, regulators',
          'How a trade executes end-to-end',
          'Role of investment banks vs commercial banks',
          'Clearing, settlement, custodians',
          'Market microstructure basics',
        ],
      },
      {
        id: 'f2',
        title: 'Reading Financial Statements',
        hours: 3,
        topics: [
          'The Income Statement: revenue to net income',
          'The Balance Sheet: assets = liabilities + equity',
          'The Cash Flow Statement: operating, investing, financing',
          'How the three statements connect',
          'Accrual vs cash accounting',
          'Why net income does not equal cash flow',
          'Introduction to ratio analysis',
          'Red flags in financial statements',
        ],
      },
      {
        id: 'f3',
        title: 'Macroeconomics for Finance',
        hours: 2,
        topics: [
          'GDP, inflation, unemployment and what they signal',
          'Business cycles: expansion, peak, contraction, trough',
          'Central banks: tools, mandates, transmission mechanism',
          'Monetary policy: rate decisions and quantitative easing',
          'Fiscal policy: government spending, deficits, debt',
          'Yield curves: what shapes mean and why they matter',
          'How macro conditions affect equity, bond, FX markets',
        ],
      },
      {
        id: 'f4',
        title: 'Investment Fundamentals',
        hours: 2,
        topics: [
          'Return and risk: holding period return, annualized return',
          'The risk-return tradeoff',
          'Diversification and correlation intuitively explained',
          'Asset classes and their characteristic risk profiles',
          'Intrinsic value vs market price',
          'What analysts actually do day-to-day',
          'Buy-side vs sell-side: different jobs, different incentives',
        ],
      },
    ],
  },

  cfa1: {
    id: 'cfa1',
    label: 'Core Finance',
    icon: '📈',
    color: '#3B82F6',
    description: 'CFA Level 1 curriculum: foundational knowledge across all finance disciplines',
    unlocks: 'foundation',
    modules: [
      {
        id: 'cfa1_ethics',
        title: 'Professional Ethics and Standards',
        hours: 25,
        topics: [
          'Why ethics matters in finance',
          'CFA Institute Code of Ethics',
          'Standards of Professional Conduct I–VII',
          'Conflicts of interest and how they manifest',
          'Fiduciary duty',
          'Insider trading: definition, cases, consequences',
          'Research objectivity standards',
          'Real cases: Ivan Boesky, Raj Rajaratnam',
        ],
      },
      {
        id: 'cfa1_quant',
        title: 'Quantitative Methods',
        hours: 20,
        topics: [
          'Time Value of Money — the most important concept in finance',
          'Net Present Value and Internal Rate of Return',
          'Statistics for finance: mean, variance, covariance, correlation',
          'Probability distributions: normal, lognormal',
          'Hypothesis testing: how analysts test assumptions',
          'Introduction to linear regression',
          'Sampling and estimation',
        ],
      },
      {
        id: 'cfa1_econ',
        title: 'Economics',
        hours: 18,
        topics: [
          'Supply, demand, and market equilibrium',
          'Market structures: perfect competition to monopoly',
          'Business cycles and their drivers',
          'Monetary and fiscal policy in depth',
          'International trade: comparative advantage, trade balances',
          'Exchange rates: how and why currencies move',
          'How economic conditions translate into asset prices',
        ],
      },
      {
        id: 'cfa1_fsa',
        title: 'Financial Statement Analysis',
        hours: 30,
        topics: [
          'Deep-dive income statement analysis',
          'Balance sheet quality: what assets are really worth',
          'Cash flow analysis: why it is more reliable than earnings',
          'Financial ratio analysis: the full toolkit',
          'IFRS vs US GAAP: key practical differences',
          'Inventory methods: FIFO, LIFO, weighted average',
          'Earnings quality: how companies manipulate profits',
          'Analysing real company filings: Apple, Berkshire, Enron',
        ],
      },
      {
        id: 'cfa1_corp',
        title: 'Corporate Finance',
        hours: 15,
        topics: [
          'Capital structure theory: why it matters how a company is financed',
          'Modigliani-Miller propositions: the theoretical foundation',
          'Trade-off theory and pecking order theory',
          'Cost of capital: WACC in depth',
          'Leverage: operating, financial, and combined',
          'Working capital management: cash conversion cycle',
          'Dividends and buybacks: theory vs practice',
          'Capital allocation: how decisions create or destroy value',
        ],
      },
      {
        id: 'cfa1_equity',
        title: 'Equity Analysis and Valuation',
        hours: 20,
        topics: [
          'What equity represents and how equity markets work',
          'Industry and competitive analysis: Porter\'s Five Forces',
          'DCF Valuation: FCF projections, terminal value, sensitivity',
          'Comparable company analysis (comps)',
          'Precedent transaction analysis',
          'Price multiples: P/E, EV/EBITDA, P/B, P/S',
          'Dividend Discount Model',
          'Valuing growth companies',
        ],
      },
      {
        id: 'cfa1_fi',
        title: 'Fixed Income',
        hours: 22,
        topics: [
          'Bond mechanics: coupon, maturity, par, price',
          'Bond pricing from first principles',
          'Yield to maturity, current yield, yield to call',
          'Duration: Macaulay and Modified',
          'Convexity: why duration understates price changes',
          'The yield curve: construction and theories',
          'Credit risk: ratings, spreads, default probabilities',
          'Introduction to securitized products: MBS, ABS',
        ],
      },
      {
        id: 'cfa1_deriv',
        title: 'Derivatives',
        hours: 12,
        topics: [
          'What derivatives are and why they exist',
          'Forward contracts: structure, pricing, uses',
          'Futures contracts: margin mechanics',
          'Options: calls, puts, payoff diagrams',
          'Option pricing: Black-Scholes intuition and formula',
          'The Greeks: Delta, Gamma, Theta, Vega, Rho',
          'Interest rate swaps: structure and uses',
          'How companies hedge using derivatives',
        ],
      },
      {
        id: 'cfa1_alt',
        title: 'Alternative Investments',
        hours: 10,
        topics: [
          'Private equity: venture capital, growth equity, buyouts',
          'LBO mechanics: capital structure, returns, IRR analysis',
          'Hedge fund strategies: long/short, macro, arbitrage',
          'Real estate: direct investment, REITs, valuation',
          'Infrastructure and commodities',
          'How institutional investors allocate to alternatives',
        ],
      },
      {
        id: 'cfa1_pm',
        title: 'Portfolio Management',
        hours: 12,
        topics: [
          'Modern Portfolio Theory: diversification, efficient frontier',
          'CAPM: theory, assumptions, Security Market Line',
          'Risk-adjusted returns: Sharpe, Sortino, Treynor, Jensen\'s Alpha',
          'Asset allocation: strategic vs tactical',
          'The investment policy statement',
          'Introduction to factor investing',
          'Portfolio rebalancing: when and how',
          'Performance attribution',
        ],
      },
    ],
  },

  cfa2: {
    id: 'cfa2',
    label: 'Advanced Finance',
    icon: '🔬',
    color: '#8B5CF6',
    description: 'CFA Level 2 depth: application, analysis, and real-world model building',
    unlocks: 'cfa1',
    modules: [
      {
        id: 'cfa2_ethics',
        title: 'Ethics in Practice: Complex Cases',
        hours: 15,
        topics: ['Complex ethical scenarios', 'Conflicts in sell-side research', 'Compliance programs', 'GIPS compliance', 'Global regulatory environment'],
      },
      {
        id: 'cfa2_quant',
        title: 'Advanced Quantitative Methods',
        hours: 18,
        topics: ['Multiple regression and its assumptions', 'Time series analysis', 'Forecasting models', 'Machine learning in finance overview', 'Big data applications'],
      },
      {
        id: 'cfa2_econ',
        title: 'Economics: Currency and Growth',
        hours: 15,
        topics: ['Currency exchange rate forecasting', 'Economic growth and investment implications', 'Regulation and its market impact', 'Trade policy analysis'],
      },
      {
        id: 'cfa2_fsa',
        title: 'Advanced Financial Statement Analysis',
        hours: 25,
        topics: ['Intercorporate investments', 'Multinational operations: translation methods', 'Employee compensation and pension accounting', 'IFRS vs GAAP differences: comprehensive', 'Evaluating quality of financial reports', 'FSA integration techniques'],
      },
      {
        id: 'cfa2_corp',
        title: 'Corporate Finance: Advanced',
        hours: 15,
        topics: ['Advanced capital structure analysis', 'Dividend policy: real-world evidence', 'Corporate governance and ESG', 'Mergers, acquisitions, and restructuring', 'Business and financial risk'],
      },
      {
        id: 'cfa2_equity',
        title: 'Equity Valuation: Advanced Models',
        hours: 22,
        topics: ['FCFF vs FCFE: when to use each', 'Gordon Growth Model and multi-stage DDM', 'Residual income model', 'Private company valuation', 'Sector-specific valuation: banks, insurance, mining', 'Sum-of-parts valuation'],
      },
      {
        id: 'cfa2_fi',
        title: 'Fixed Income: Advanced',
        hours: 20,
        topics: ['Spot rates, forward rates, and the swap rate curve', 'Valuing bonds with embedded options', 'Credit analysis models', 'Credit default swaps', 'Mortgage-backed securities mechanics', 'Structured products'],
      },
      {
        id: 'cfa2_deriv',
        title: 'Derivatives: Valuation and Strategy',
        hours: 15,
        topics: ['Swap valuation in practice', 'Interest rate derivatives', 'Option strategies: spreads, straddles, collars', 'Volatility as an asset class', 'Using derivatives for risk management'],
      },
      {
        id: 'cfa2_alt',
        title: 'Alternative Investments: Due Diligence',
        hours: 12,
        topics: ['PE valuation methods', 'Hedge fund due diligence', 'Real estate valuation: DCF and cap rate', 'Infrastructure investment analysis', 'Commodities: futures pricing'],
      },
      {
        id: 'cfa2_pm',
        title: 'Portfolio Management: Active Management',
        hours: 15,
        topics: ['Economics and investment markets', 'Active vs passive management theory', 'Factor models: Fama-French, Carhart', 'Portfolio construction: active share, tracking error', 'Trading costs and their impact'],
      },
    ],
  },

  cfa3: {
    id: 'cfa3',
    label: 'Professional Mastery',
    icon: '🏆',
    color: '#F59E0B',
    description: 'CFA Level 3: portfolio management synthesis and professional practice',
    unlocks: 'cfa2',
    modules: [
      {
        id: 'cfa3_behav',
        title: 'Behavioral Finance',
        hours: 12,
        topics: ['Cognitive biases in investing', 'Emotional biases', 'Market anomalies explained by behavior', 'Practical implications for portfolio management', 'Advisor-client behavioral dynamics'],
      },
      {
        id: 'cfa3_cme',
        title: 'Capital Market Expectations',
        hours: 15,
        topics: ['Framework for forecasting asset returns', 'Economic scenario building', 'Equity risk premium estimation', 'Fixed income return forecasting', 'Building capital market assumptions'],
      },
      {
        id: 'cfa3_aa',
        title: 'Asset Allocation',
        hours: 20,
        topics: ['Strategic asset allocation framework', 'Tactical asset allocation', 'Dynamic asset allocation', 'Risk budgeting approach', 'Liability-driven investing for pension funds', 'Goals-based wealth management'],
      },
      {
        id: 'cfa3_fi',
        title: 'Fixed Income Portfolio Management',
        hours: 18,
        topics: ['Immunization strategies', 'Duration matching for liabilities', 'Contingent immunization', 'Yield curve strategies', 'Credit strategies', 'Global and international bond management'],
      },
      {
        id: 'cfa3_eq',
        title: 'Equity Portfolio Management',
        hours: 16,
        topics: ['Active vs passive portfolio construction', 'Factor-based equity strategies', 'Long-short equity management', 'Global equity management', 'ESG integration in equity portfolios'],
      },
      {
        id: 'cfa3_alt',
        title: 'Alternative Investments for Portfolios',
        hours: 12,
        topics: ['PE allocation for institutional investors', 'Hedge fund portfolio construction', 'Real assets in portfolio context', 'Commodities as inflation hedge', 'Private credit'],
      },
      {
        id: 'cfa3_risk',
        title: 'Risk Management Applications',
        hours: 15,
        topics: ['VaR and CVaR applications', 'Derivatives for portfolio risk management', 'Credit risk management', 'Liquidity risk management', 'Enterprise risk management', 'Stress testing portfolios'],
      },
      {
        id: 'cfa3_trade',
        title: 'Trading and Performance Evaluation',
        hours: 12,
        topics: ['Trading strategies and their costs', 'Transaction cost analysis', 'Performance measurement and attribution', 'Benchmark selection', 'Manager due diligence and selection', 'Reporting to clients'],
      },
      {
        id: 'cfa3_ethics',
        title: 'Ethics in Professional Practice',
        hours: 10,
        topics: ['Ethical decision-making framework', 'Complex conflicts of interest', 'Regulatory environment globally', 'Professional responsibilities to clients', 'Case studies in professional ethics'],
      },
    ],
  },
}

// Flattened list of all concepts for flashcards and search
export const getAllConcepts = () => {
  const concepts = []
  Object.values(TRACKS).forEach(track => {
    track.modules.forEach(module => {
      module.topics.forEach(topic => {
        concepts.push({
          id: `${module.id}_${topic.replace(/\s+/g, '_').toLowerCase()}`,
          title: topic,
          moduleId: module.id,
          moduleTitle: module.title,
          trackId: track.id,
          trackLabel: track.label,
        })
      })
    })
  })
  return concepts
}

// Get all module IDs in order for progress tracking
export const getAllModuleIds = () => {
  return Object.values(TRACKS).flatMap(track => track.modules.map(m => m.id))
}

// Check if track is unlocked
export const isTrackUnlocked = (trackId) => {
  const track = TRACKS[trackId]
  if (!track.unlocks) return true

  const requiredTrack = TRACKS[track.unlocks]
  if (!requiredTrack) return true

  const requiredModuleIds = requiredTrack.modules.map(m => m.id)
  return requiredModuleIds.every(id => {
    return localStorage.getItem(`fm_progress_${id}`) === 'true'
  })
}

export const getTrackProgress = (trackId) => {
  const track = TRACKS[trackId]
  if (!track) return 0
  const total = track.modules.length
  const done = track.modules.filter(m => localStorage.getItem(`fm_progress_${m.id}`) === 'true').length
  return total === 0 ? 0 : Math.round((done / total) * 100)
}
