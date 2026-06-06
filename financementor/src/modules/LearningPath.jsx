import React, { useState } from 'react'
import { Card, ProgressRing, Badge, SectionHeader } from '../components/ui/index.jsx'
import { TRACKS, getTrackProgress, isTrackUnlocked } from '../data/curriculum.js'
import { Lock, CheckCircle, Circle, ChevronDown, ChevronRight, Clock, BookOpen } from 'lucide-react'

const TRACK_COLORS = {
  foundation: '#22C55E',
  cfa1: '#3B82F6',
  cfa2: '#8B5CF6',
  cfa3: '#F59E0B',
}

const TRACK_VARIANTS = {
  foundation: 'foundation',
  cfa1: 'cfa1',
  cfa2: 'cfa2',
  cfa3: 'cfa3',
}

function TopicRow({ topic, moduleId, isCompleted, onToggle }) {
  return (
    <div
      onClick={() => onToggle(moduleId, topic)}
      className={`flex items-start gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
        isCompleted ? 'opacity-60 hover:opacity-80' : 'hover:bg-bg-hover'
      }`}
    >
      {isCompleted
        ? <CheckCircle size={14} className="text-positive flex-shrink-0 mt-0.5" />
        : <Circle size={14} className="text-border flex-shrink-0 mt-0.5 group-hover:text-accent" />
      }
      <span className={`text-xs leading-relaxed ${isCompleted ? 'text-text-muted line-through' : 'text-text-secondary'}`}>
        {topic}
      </span>
    </div>
  )
}

function ModuleCard({ module, trackId, unlocked, onNavigate }) {
  const [expanded, setExpanded] = useState(false)
  const isCompleted = localStorage.getItem(`fm_progress_${module.id}`) === 'true'
  const color = TRACK_COLORS[trackId]

  const completedTopics = module.topics.filter((_, i) =>
    localStorage.getItem(`fm_topic_${module.id}_${i}`) === 'true'
  ).length
  const topicProgress = Math.round((completedTopics / module.topics.length) * 100)

  const handleMarkComplete = (e) => {
    e.stopPropagation()
    if (!unlocked) return
    const newState = !isCompleted
    localStorage.setItem(`fm_progress_${module.id}`, newState)
    window.location.reload()
  }

  const handleTopicToggle = (moduleId, topic) => {
    if (!unlocked) return
    const idx = module.topics.indexOf(topic)
    const key = `fm_topic_${moduleId}_${idx}`
    const current = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, !current)
    window.location.reload()
  }

  return (
    <div className={`border rounded-xl transition-all ${
      !unlocked ? 'border-border opacity-50' :
      isCompleted ? 'border-positive/30 bg-positive/5' :
      'border-border bg-bg-card hover:border-border-light'
    }`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => unlocked && setExpanded(!expanded)}
      >
        {!unlocked
          ? <Lock size={16} className="text-text-muted flex-shrink-0" />
          : isCompleted
          ? <CheckCircle size={16} className="text-positive flex-shrink-0" />
          : (
            <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: color }}>
              {topicProgress > 0 && (
                <div className="w-full h-full rounded-full opacity-40" style={{ background: color, transform: `scale(${topicProgress / 100})` }} />
              )}
            </div>
          )
        }

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${!unlocked ? 'text-text-muted' : 'text-text-primary'}`}>
              {module.title}
            </span>
            {isCompleted && <Badge variant="green">Complete</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={10} /> {module.hours} hrs
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <BookOpen size={10} /> {module.topics.length} topics
            </span>
            {topicProgress > 0 && !isCompleted && (
              <span className="text-xs font-mono" style={{ color }}>{topicProgress}%</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unlocked && !isCompleted && (
            <button
              onClick={handleMarkComplete}
              className="text-xs px-2.5 py-1 rounded-lg border border-positive/30 text-positive hover:bg-positive/10 transition-all"
            >
              Mark done
            </button>
          )}
          {unlocked && (expanded
            ? <ChevronDown size={14} className="text-text-muted" />
            : <ChevronRight size={14} className="text-text-muted" />
          )}
        </div>
      </div>

      {/* Topics */}
      {expanded && unlocked && (
        <div className="border-t border-border pb-2">
          {module.topics.map((topic, i) => (
            <TopicRow
              key={i}
              topic={topic}
              moduleId={module.id}
              isCompleted={localStorage.getItem(`fm_topic_${module.id}_${i}`) === 'true'}
              onToggle={handleTopicToggle}
            />
          ))}
          <div className="px-3 pt-2">
            <button
              onClick={() => {
                const settings = { concept: module.title, track: trackId }
                localStorage.setItem('fm_last_concept', JSON.stringify(settings))
                onNavigate('concepts')
              }}
              className="text-xs text-accent hover:underline"
            >
              Open in Concept Library →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TrackSection({ trackId, track, onNavigate }) {
  const [expanded, setExpanded] = useState(trackId === 'foundation')
  const unlocked = isTrackUnlocked(trackId)
  const progress = getTrackProgress(trackId)
  const color = TRACK_COLORS[trackId]
  const totalHours = track.modules.reduce((s, m) => s + (m.hours || 0), 0)

  return (
    <div className={`rounded-2xl border transition-all ${!unlocked ? 'border-border opacity-60' : 'border-border'}`}>
      {/* Track header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-bg-hover/50 rounded-2xl transition-all"
        onClick={() => unlocked && setExpanded(!expanded)}
      >
        <ProgressRing
          percent={progress}
          size={52}
          strokeWidth={4}
          color={unlocked ? color : '#334155'}
          label={unlocked ? `${progress}%` : undefined}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg">{track.icon}</span>
            <span className="font-display font-bold text-base text-text-primary">{track.label}</span>
            {!unlocked && <span className="flex items-center gap-1 text-xs text-text-muted"><Lock size={11} /> Locked</span>}
            {progress === 100 && <Badge variant="green">Complete</Badge>}
          </div>
          <p className="text-xs text-text-secondary mb-1.5">{track.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">{track.modules.length} modules</span>
            <span className="text-xs text-text-muted">~{totalHours} hours</span>
            {!unlocked && track.unlocks && (
              <span className="text-xs text-text-muted">
                Complete {TRACKS[track.unlocks]?.label} to unlock
              </span>
            )}
          </div>
        </div>
        {unlocked && (
          expanded
            ? <ChevronDown size={16} className="text-text-muted" />
            : <ChevronRight size={16} className="text-text-muted" />
        )}
        {!unlocked && <Lock size={16} className="text-text-muted" />}
      </div>

      {/* Modules */}
      {expanded && unlocked && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-4">
          {track.modules.map(module => (
            <ModuleCard
              key={module.id}
              module={module}
              trackId={trackId}
              unlocked={unlocked}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LearningPath({ onNavigate }) {
  const overallProgress = Math.round(
    Object.keys(TRACKS).reduce((sum, id) => sum + getTrackProgress(id), 0) / Object.keys(TRACKS).length
  )

  const totalHours = Object.values(TRACKS).reduce((s, t) => s + t.modules.reduce((ms, m) => ms + (m.hours || 0), 0), 0)

  return (
    <div className="max-w-3xl space-y-4 animate-fade-in">
      <SectionHeader
        title="Learning Path"
        subtitle="Your structured journey from financial literacy to professional mastery"
      />

      {/* Overall progress card */}
      <Card className="flex items-center gap-6">
        <ProgressRing percent={overallProgress} size={64} strokeWidth={5} color="#3B82F6" label={`${overallProgress}%`} />
        <div className="flex-1">
          <p className="font-semibold text-text-primary mb-0.5">Overall Progress</p>
          <p className="text-xs text-text-secondary">Complete each track in sequence. Advanced tracks unlock when prerequisites are done.</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-text-muted">{Object.keys(TRACKS).length} tracks</span>
            <span className="text-xs text-text-muted">~{totalHours} total hours</span>
            <span className="text-xs text-text-muted">{Object.values(TRACKS).reduce((s, t) => s + t.modules.length, 0)} modules</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('concepts')}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all flex-shrink-0"
        >
          Continue →
        </button>
      </Card>

      {/* Track flow indicator */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {Object.entries(TRACKS).map(([id, track], i) => {
          const progress = getTrackProgress(id)
          const unlocked = isTrackUnlocked(id)
          const color = TRACK_COLORS[id]
          return (
            <React.Fragment key={id}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  !unlocked ? 'border-border text-text-muted bg-transparent' :
                  progress === 100 ? 'border-positive/50 text-positive bg-positive/10' :
                  'border-border text-text-secondary bg-bg-card'
                }`}>
                  {track.icon} {track.label}
                  {!unlocked && ' 🔒'}
                  {progress > 0 && progress < 100 && <span className="ml-1 font-mono" style={{ color }}>{progress}%</span>}
                  {progress === 100 && ' ✓'}
                </div>
              </div>
              {i < Object.keys(TRACKS).length - 1 && (
                <span className="text-text-muted text-sm flex-shrink-0">→</span>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Track sections */}
      {Object.entries(TRACKS).map(([id, track]) => (
        <TrackSection key={id} trackId={id} track={track} onNavigate={onNavigate} />
      ))}
    </div>
  )
}
