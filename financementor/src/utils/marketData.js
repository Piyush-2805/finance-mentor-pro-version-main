// Free market data APIs (no key required) for real-time prices

// CoinGecko - Free crypto data
export const getCryptoPrices = async (coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple']) => {
  const ids = coins.join(',')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
  )
  if (!res.ok) throw new Error('Failed to fetch crypto prices')
  const data = await res.json()

  return Object.entries(data).map(([id, info]) => ({
    symbol: id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    price: info.usd,
    change24h: info.usd_24h_change?.toFixed(2) || 0,
    marketCap: info.usd_market_cap,
  }))
}

// ExchangeRate API - Free forex data
export const getForexRates = async (base = 'USD') => {
  const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`)
  if (!res.ok) throw new Error('Failed to fetch forex rates')
  const data = await res.json()

  const majors = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'INR', 'CNY', 'SGD']
  return majors.map(currency => ({
    pair: `${base}/${currency}`,
    rate: data.rates[currency],
    currency,
  }))
}

// Format large numbers
export const formatMarketCap = (num) => {
  if (!num) return 'N/A'
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  return `$${num.toLocaleString()}`
}
