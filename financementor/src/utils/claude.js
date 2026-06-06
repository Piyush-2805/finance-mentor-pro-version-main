// AI API utility with built-in caching — supports Claude and Gemini

const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem('fm_settings') || '{}')
  } catch {
    return {}
  }
}

// Call Groq as alternative to Claude
const callGroqInternal = async (systemPrompt, userMessage, maxTokens = 2000) => {
  const settings = getSettings()
  const groqKey = settings.geminiKey || ''
  if (!groqKey) throw new Error('NO_API_KEY')

  const level = settings.level || 'Core Finance'
  const style = settings.style || 'Case-Study Driven'

  const enhancedSystem = `${systemPrompt}

User's current learning level: ${level}.
Preferred teaching style: ${style}.
Always use precise, professional finance terminology.
All deal examples must be real, documented transactions with accurate figures.
All formulas must be mathematically correct with every variable defined.
Never fabricate financial data or statistics.`

  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: enhancedSystem + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown code fences, no explanation outside the JSON object.' },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.2,
    }),
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('Empty response from Groq')

  try {
    return JSON.parse(raw)
  } catch {
    const clean = raw.replace(/```json\n?|```\n?/g, '').trim()
    const start = clean.search(/[{\[]/)
    const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'))
    if (start === -1) throw new Error('Invalid JSON response')
    return JSON.parse(clean.substring(start, end + 1))
  }
}

export const callClaude = async (systemPrompt, userMessage, maxTokens = 2000) => {
  const settings = getSettings()
  const apiKey = settings.apiKey || ''
  const geminiKey = settings.geminiKey || ''
  const level = settings.level || 'Core Finance'
  const style = settings.style || 'Case-Study Driven'

  // If no Claude key, fall back to Groq
  if (!apiKey) {
    if (geminiKey) return callGroqInternal(systemPrompt, userMessage, maxTokens)
    throw new Error('NO_API_KEY')
  }

  const enhancedSystem = `${systemPrompt}

User's current learning level: ${level}.
Preferred teaching style: ${style}.
Always use precise, professional finance terminology.
All deal examples must be real, documented transactions with accurate figures.
All formulas must be mathematically correct with every variable defined.
Never fabricate financial data or statistics.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: enhancedSystem,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)

  const raw = data.content[0].text
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim()
  const start = clean.search(/[{\[]/)
  const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'))

  if (start === -1) throw new Error('Invalid JSON response')
  return JSON.parse(clean.substring(start, end + 1))
}

// Cached version — always serves from cache if available
export const getCachedContent = async (cacheKey, systemPrompt, userMessage, maxTokens = 2000) => {
  const key = `fm_content_${cacheKey.replace(/[\s/\\'"]/g, '_').toLowerCase()}`
  const cached = localStorage.getItem(key)

  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      localStorage.removeItem(key)
    }
  }

  const content = await callClaude(systemPrompt, userMessage, maxTokens)
  localStorage.setItem(key, JSON.stringify(content))
  return content
}

// Clear specific cached content
export const clearCachedContent = (cacheKey) => {
  const key = `fm_content_${cacheKey.replace(/[\s/\\'"]/g, '_').toLowerCase()}`
  localStorage.removeItem(key)
}

// Test API connection
export const testConnection = async (apiKey) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return true
}
