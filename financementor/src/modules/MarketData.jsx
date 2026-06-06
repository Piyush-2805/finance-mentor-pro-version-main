import React, { useState, useEffect } from 'react'
import { Card, Badge, SectionHeader, showToast } from '../components/ui/index.jsx'
import { getCryptoPrices, getForexRates, formatMarketCap } from '../utils/marketData.js'
import { getMarketData, getMarketNews, getAssetAnalysis } from '../utils/gemini.js'
import {
  TrendingUp, TrendingDown, RefreshCw, Search, Globe,
  DollarSign, Bitcoin, BarChart2, Newspaper, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-accent text-white' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
)

function CryptoPanel() {
  const [crypto, setCrypto] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCrypto = async () => {
    setLoading(true); setError(null)
    try {
      const data = await getCryptoPrices()
      setCrypto(data)
    } catch (e) {
      setError('Failed to load crypto data. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCrypto() }, [])

  if (loading) return <LoadingSkeleton count={5} />
  if (error) return <ErrorState message={error} onRetry={loadCrypto} />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-muted">Live prices from CoinGecko</p>
        <button onClick={loadCrypto} className="text-xs text-accent hover:underline flex items-center gap-1">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <div className="grid gap-3">
        {crypto.map(coin => (
          <Card key={coin.symbol} className="!p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                  <Bitcoin size={16} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-text-primary">{coin.name}</p>
                  <p className="text-xs text-text-muted uppercase">{coin.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-sm text-text-primary">
                  ${coin.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
                  parseFloat(coin.change24h) >= 0 ? 'text-positive' : 'text-negative'
                }`}>
                  {parseFloat(coin.change24h) >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {Math.abs(coin.change24h)}%
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-text-muted">Market Cap: <span className="text-text-secondary font-mono">{formatMarketCap(coin.marketCap)}</span></p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ForexPanel() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRates = async () => {
    setLoading(true); setError(null)
    try {
      const data = await getForexRates()
      setRates(data)
    } catch (e) {
      setError('Failed to load forex data. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRates() }, [])

  if (loading) return <LoadingSkeleton count={5} />
  if (error) return <ErrorState message={error} onRetry={loadRates} />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-muted">Exchange rates (base: USD)</p>
        <button onClick={loadRates} className="text-xs text-accent hover:underline flex items-center gap-1">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rates.map(r => (
          <Card key={r.pair} className="!p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-gold" />
                <span className="font-semibold text-sm text-text-primary">{r.pair}</span>
              </div>
              <span className="font-mono text-sm text-text-primary">{r.rate?.toFixed(4)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StocksPanel({ hasGeminiKey }) {
  const [query, setQuery] = useState('')
  const [stocks, setStocks] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchStocks = async () => {
    if (!query.trim()) return
    if (!hasGeminiKey) { showToast('Add your Groq API key in Settings first', 'error'); return }
    setLoading(true); setError(null)
    try {
      const data = await getMarketData(`Stock prices for: ${query}`)
      setStocks(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchStocks()}
            placeholder="Search stocks (e.g., AAPL, MSFT, TSLA)..."
            className="w-full pl-9 pr-3 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={searchStocks}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {!hasGeminiKey && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-xs text-text-secondary">
          🔑 Add your Groq API key in Settings to search stocks and get AI-powered market analysis.
        </div>
      )}

      {error && <ErrorState message={error} />}

      {stocks && (
        <div className="space-y-3">
          {stocks.disclaimer && (
            <p className="text-xs text-text-muted italic">{stocks.disclaimer}</p>
          )}
          {stocks.data?.map((item, i) => (
            <Card key={i} className="!p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-muted font-mono">{item.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-sm text-text-primary">
                    {item.currency === 'INR' ? '₹' : '$'}{item.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  {item.changePercent != null && (
                    <p className={`text-xs font-mono ${item.changePercent >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {stocks.lastUpdated && (
            <p className="text-xs text-text-muted text-right">Updated: {stocks.lastUpdated}</p>
          )}
        </div>
      )}
    </div>
  )
}

function NewsPanel({ hasGeminiKey }) {
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [topic, setTopic] = useState('global markets')

  const loadNews = async () => {
    if (!hasGeminiKey) { showToast('Add your Groq API key in Settings first', 'error'); return }
    setLoading(true); setError(null)
    try {
      const data = await getMarketNews(topic)
      setNews(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const impactColors = { positive: 'text-positive', negative: 'text-negative', neutral: 'text-text-muted' }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadNews()}
          placeholder="Topic (e.g., tech stocks, crypto, Fed policy)..."
          className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
        />
        <button
          onClick={loadNews}
          disabled={loading}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Get News'}
        </button>
      </div>

      {!hasGeminiKey && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-xs text-text-secondary">
          🔑 Add your Groq API key in Settings to get AI-powered market news and analysis.
        </div>
      )}

      {error && <ErrorState message={error} />}

      {news && (
        <div className="space-y-3">
          {news.keyTakeaway && (
            <Card className="!p-3 border-accent/30">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={news.marketSentiment === 'bullish' ? 'positive' : news.marketSentiment === 'bearish' ? 'negative' : 'neutral'}>
                  {news.marketSentiment?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-text-primary">{news.keyTakeaway}</p>
            </Card>
          )}
          {news.headlines?.map((item, i) => (
            <Card key={i} className="!p-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${impactColors[item.impact] || 'text-text-muted'}`}>
                  {item.impact === 'positive' ? <TrendingUp size={14} /> : item.impact === 'negative' ? <TrendingDown size={14} /> : <Globe size={14} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{item.summary}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-text-muted">{item.sector}</span>
                    <span className="text-xs text-text-muted">• {item.timeAgo}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalysisPanel({ hasGeminiKey }) {
  const [symbol, setSymbol] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAnalysis = async () => {
    if (!symbol.trim()) return
    if (!hasGeminiKey) { showToast('Add your Groq API key in Settings first', 'error'); return }
    setLoading(true); setError(null)
    try {
      const data = await getAssetAnalysis(symbol.toUpperCase())
      setAnalysis(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadAnalysis()}
          placeholder="Enter ticker (e.g., AAPL, GOOGL, BTC)..."
          className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent font-mono"
        />
        <button
          onClick={loadAnalysis}
          disabled={loading || !symbol.trim()}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {!hasGeminiKey && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-xs text-text-secondary">
          🔑 Add your Groq API key in Settings for deep asset analysis.
        </div>
      )}

      {error && <ErrorState message={error} />}

      {analysis && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-text-primary">{analysis.name}</h3>
              <p className="text-sm text-text-muted font-mono">{analysis.symbol}</p>
            </div>
            {analysis.currentPrice && (
              <p className="font-mono text-xl font-bold text-accent">
                ${analysis.currentPrice.toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {analysis.marketCap && <MetricBox label="Market Cap" value={analysis.marketCap} />}
            {analysis.peRatio && <MetricBox label="P/E Ratio" value={analysis.peRatio} />}
            {analysis.fiftyTwoWeekHigh && <MetricBox label="52W High" value={`$${analysis.fiftyTwoWeekHigh}`} />}
            {analysis.fiftyTwoWeekLow && <MetricBox label="52W Low" value={`$${analysis.fiftyTwoWeekLow}`} />}
          </div>

          {analysis.analystRating && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-text-muted">Analyst Rating:</span>
              <Badge variant={analysis.analystRating.includes('Buy') ? 'positive' : analysis.analystRating.includes('Sell') ? 'negative' : 'neutral'}>
                {analysis.analystRating}
              </Badge>
            </div>
          )}

          {analysis.keyMetrics && (
            <div className="bg-bg-secondary rounded-lg p-3 mb-3 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-text-muted">Revenue</p>
                <p className="text-sm font-mono font-semibold text-text-primary">{analysis.keyMetrics.revenue}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted">Earnings</p>
                <p className="text-sm font-mono font-semibold text-text-primary">{analysis.keyMetrics.earnings}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted">Dividend</p>
                <p className="text-sm font-mono font-semibold text-text-primary">{analysis.keyMetrics.dividend}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {analysis.recentNews && (
              <div className="p-2 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-muted font-semibold mb-0.5">Recent News</p>
                <p className="text-sm text-text-secondary">{analysis.recentNews}</p>
              </div>
            )}
            {analysis.technicalView && (
              <div className="p-2 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-muted font-semibold mb-0.5">Technical View</p>
                <p className="text-sm text-text-secondary">{analysis.technicalView}</p>
              </div>
            )}
            {analysis.fundamentalView && (
              <div className="p-2 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-muted font-semibold mb-0.5">Fundamental View</p>
                <p className="text-sm text-text-secondary">{analysis.fundamentalView}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function MetricBox({ label, value }) {
  return (
    <div className="bg-bg-secondary rounded-lg p-2 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-mono font-semibold text-text-primary">{value}</p>
    </div>
  )
}

function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg-secondary rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-bg-hover rounded w-2/3 mb-2" />
          <div className="h-3 bg-bg-hover rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-negative/10 border border-negative/30 rounded-xl p-4 text-center">
      <p className="text-sm text-negative mb-2">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-accent hover:underline">
          Try Again
        </button>
      )}
    </div>
  )
}

export default function MarketData({ hasGeminiKey }) {
  const [activeTab, setActiveTab] = useState('crypto')
  const settings = JSON.parse(localStorage.getItem('fm_settings') || '{}')
  const geminiAvailable = hasGeminiKey || !!settings.geminiKey

  return (
    <div className="space-y-5 animate-fade-in">
      <SectionHeader
        title="Real-Time Market Data"
        subtitle="Live prices, news, and AI-powered analysis"
      />

      <div className="flex flex-wrap gap-2 bg-bg-secondary p-1.5 rounded-xl">
        <TabButton active={activeTab === 'crypto'} onClick={() => setActiveTab('crypto')} icon={Bitcoin} label="Crypto" />
        <TabButton active={activeTab === 'forex'} onClick={() => setActiveTab('forex')} icon={DollarSign} label="Forex" />
        <TabButton active={activeTab === 'stocks'} onClick={() => setActiveTab('stocks')} icon={BarChart2} label="Stocks" />
        <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={Newspaper} label="News" />
        <TabButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={TrendingUp} label="Analysis" />
      </div>

      <div>
        {activeTab === 'crypto' && <CryptoPanel />}
        {activeTab === 'forex' && <ForexPanel />}
        {activeTab === 'stocks' && <StocksPanel hasGeminiKey={geminiAvailable} />}
        {activeTab === 'news' && <NewsPanel hasGeminiKey={geminiAvailable} />}
        {activeTab === 'analysis' && <AnalysisPanel hasGeminiKey={geminiAvailable} />}
      </div>
    </div>
  )
}
