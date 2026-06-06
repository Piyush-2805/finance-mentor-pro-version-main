// SM-2 Spaced Repetition Algorithm
// quality: 0=blackout, 1=wrong, 2=wrong with recognition, 3=hard correct, 4=correct, 5=effortless

export const initialCardState = () => ({
  ease: 2.5,
  interval: 1,
  reps: 0,
  nextReview: new Date().toISOString(),
  lastQuality: null,
})

export const updateSM2 = (card, quality) => {
  let { ease, interval, reps } = card

  if (quality < 3) {
    reps = 0
    interval = 1
  } else {
    if (reps === 0) interval = 1
    else if (reps === 1) interval = 6
    else interval = Math.round(interval * ease)
    reps += 1
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    ease: Math.round(ease * 100) / 100,
    interval,
    reps,
    nextReview: nextReview.toISOString(),
    lastQuality: quality,
  }
}

export const getCardState = (conceptKey) => {
  const key = `fm_sr_${conceptKey.replace(/\s+/g, '_').toLowerCase()}`
  const stored = localStorage.getItem(key)
  if (stored) {
    try { return JSON.parse(stored) } catch {}
  }
  return initialCardState()
}

export const saveCardState = (conceptKey, state) => {
  const key = `fm_sr_${conceptKey.replace(/\s+/g, '_').toLowerCase()}`
  localStorage.setItem(key, JSON.stringify(state))
}

export const isDueForReview = (card) => {
  if (!card.nextReview) return true
  return new Date(card.nextReview) <= new Date()
}

export const getDueCount = (conceptKeys) => {
  return conceptKeys.filter(key => isDueForReview(getCardState(key))).length
}

export const formatNextReview = (card) => {
  if (!card.nextReview) return 'Due now'
  const next = new Date(card.nextReview)
  const now = new Date()
  const diff = next - now
  if (diff <= 0) return 'Due now'
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}
