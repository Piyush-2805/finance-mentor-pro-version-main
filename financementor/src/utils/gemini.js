// Groq API utility for real-time market data and AI insights

const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem('fm_settings') || '{}')
  } catch {
    return {}
  }
}

export const callGroq = async (prompt, maxTokens = 2000) => {
  const settings = getSettings()
  const apiKey = settings.geminiKey || ''

  if (!apiKey) throw new Error('NO_GEMINI_KEY')

  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Always respond with valid JSON only. No markdown code fences, no explanation, no extra text before or after the JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty response from Groq')
  return text
}

export const callGeminiJSON = async (prompt, maxTokens = 2000) => {
  const raw = await callGroq(prompt, maxTokens)
  try {
    return JSON.parse(raw)
  } catch {
    // Fallback: try to extract JSON from the response
    const clean = raw.replace(/```json\n?|```\n?/g, '').trim()
    const start = clean.search(/[{\[]/)
    const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'))
    if (start === -1) throw new Error('Invalid JSON response')
    return JSON.parse(clean.substring(start, end + 1))
  }
}

export const testGeminiConnection = async (apiKey) => {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10,
    }),
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return true
}

// Get real-time market data via Gemini
export const getMarketData = async (query) => {
  const prompt = `You are a financial data assistant. Provide the latest available market data for: ${query}

Return ONLY valid JSON in this format (no explanation, no markdown):
{
  "data": [
    {
      "symbol": "ticker/pair",
      "name": "full name",
      "price": number,
      "change": number (absolute change),
      "changePercent": number (percent change),
      "currency": "USD"
    }
  ],
  "lastUpdated": "approximate time description",
  "disclaimer": "brief note about data freshness"
}`

  return await callGeminiJSON(prompt)
}

// Get market news/analysis
export const getMarketNews = async (topic = 'global markets') => {
  const prompt = `You are a financial news analyst. Provide the latest significant market news and developments about: ${topic}

Return ONLY valid JSON (no markdown, no explanation):
{
  "headlines": [
    {
      "title": "headline text",
      "summary": "1-2 sentence summary",
      "impact": "positive" | "negative" | "neutral",
      "sector": "relevant sector",
      "timeAgo": "approximate time (e.g., '2 hours ago', 'today')"
    }
  ],
  "marketSentiment": "bullish" | "bearish" | "mixed",
  "keyTakeaway": "one sentence overall market summary"
}`

  return await callGeminiJSON(prompt)
}

// Get detailed stock/asset analysis
export const getAssetAnalysis = async (symbol) => {
  const prompt = `You are a senior financial analyst. Provide a comprehensive real-time analysis for: ${symbol}

Return ONLY valid JSON (no markdown):
{
  "symbol": "${symbol}",
  "name": "full company/asset name",
  "currentPrice": number or null if unknown,
  "marketCap": "formatted string (e.g., '$2.8T')",
  "peRatio": number or null,
  "fiftyTwoWeekHigh": number or null,
  "fiftyTwoWeekLow": number or null,
  "analystRating": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
  "keyMetrics": {
    "revenue": "formatted",
    "earnings": "formatted",
    "dividend": "yield % or N/A"
  },
  "recentNews": "1-2 sentence recent development",
  "technicalView": "brief technical analysis",
  "fundamentalView": "brief fundamental outlook"
}`

  return await callGeminiJSON(prompt)
}
