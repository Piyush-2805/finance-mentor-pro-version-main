// Financial number formatting utilities

export const formatCurrency = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(decimals)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(decimals)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(decimals)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(decimals)}K`
  return `${sign}$${abs.toFixed(2)}`
}

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${value.toFixed(decimals)}%`
}

export const formatMultiple = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${value.toFixed(decimals)}x`
}

export const formatLargeNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return value.toLocaleString('en-US')
}

// Color helpers for financial values
export const getValueColor = (value, inverted = false) => {
  if (value === 0) return 'text-text-secondary'
  const positive = inverted ? value < 0 : value > 0
  return positive ? 'text-positive' : 'text-negative'
}

export const getHeatmapColor = (value, min, max) => {
  const ratio = (value - min) / (max - min)
  if (ratio <= 0.2) return '#EF4444'
  if (ratio <= 0.4) return '#F97316'
  if (ratio <= 0.6) return '#EAB308'
  if (ratio <= 0.8) return '#84CC16'
  return '#22C55E'
}

// Validate and parse numeric input
export const parseFinancialInput = (str) => {
  const cleaned = str.replace(/[$,%,x]/g, '').replace(/,/g, '')
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}
