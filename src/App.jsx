import { useEffect, useCallback } from 'react'
import Header from './components/Header'
import EditorPane from './components/EditorPane'
import OutputPane from './components/OutputPane'
import ShareModal from './components/ShareModal'
import useGameStore from './store/gameStore'
import { parseChallengeFromURL } from './utils/encoder'

export default function App() {
  const loadCustomLevel = useGameStore((s) => s.loadCustomLevel)
  const setLoading = useGameStore((s) => s.setLoading)
  const setAiOutput = useGameStore((s) => s.setAiOutput)
  const setError = useGameStore((s) => s.setError)
  const clearError = useGameStore((s) => s.clearError)
  const userPrompt = useGameStore((s) => s.userPrompt)
  const getCurrentLevel = useGameStore((s) => s.getCurrentLevel)
  const isLoading = useGameStore((s) => s.isLoading)
  const hasWon = useGameStore((s) => s.hasWon)

  useEffect(() => {
    const customLevel = parseChallengeFromURL()
    if (customLevel) {
      loadCustomLevel(customLevel)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [loadCustomLevel])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isLoading && !hasWon) {
          handleExecute()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, hasWon, userPrompt])

  const handleExecute = useCallback(async () => {
    const level = getCurrentLevel()
    if (!userPrompt.trim() || isLoading || hasWon) return

    clearError()
    setLoading(true)
    setAiOutput('')

    const systemPrompt = level?.injectedUserMessage
      ? userPrompt.trim()
      : level?.systemPrompt ?? ''

    const userMessage = level?.injectedUserMessage
      ? level.injectedUserMessage
      : userPrompt.trim()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userMessage,
          model: 'gpt-4o-mini',
          maxTokens: 512,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? `Request failed with status ${res.status}`)
        return
      }

      setAiOutput(data.reply ?? '')
    } catch (err) {
      setError(err.message ?? 'Network error — is the API server running?')
    } finally {
      setLoading(false)
    }
  }, [
    userPrompt,
    isLoading,
    hasWon,
    getCurrentLevel,
    clearError,
    setLoading,
    setAiOutput,
    setError,
  ])

  return (
    <div className="app-root flex flex-col h-screen bg-terminal-bg text-terminal-text overflow-hidden">
      <Header onExecute={handleExecute} />

      <main className="flex flex-1 overflow-hidden">
        <LevelSidebar />

        <div className="split-view flex flex-1 overflow-hidden divide-x divide-terminal-border">
          <div className="flex-1 overflow-hidden">
            <EditorPane />
          </div>
          <div className="flex-1 overflow-hidden">
            <OutputPane />
          </div>
        </div>
      </main>

      <ShareModal />
    </div>
  )
}

function LevelSidebar() {
  const levels = useGameStore((s) => s.levels)
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const isCustomLevel = useGameStore((s) => s.isCustomLevel)
  const goToLevel = useGameStore((s) => s.goToLevel)

  const difficultyDot = {
    Beginner: 'bg-terminal-green',
    Intermediate: 'bg-terminal-yellow',
    Advanced: 'bg-terminal-cyan',
    Expert: 'bg-terminal-red',
  }

  return (
    <aside className="hidden xl:flex flex-col w-52 shrink-0 border-r border-terminal-border bg-terminal-surface overflow-y-auto">
      <div className="px-3 py-2 border-b border-terminal-border">
        <span className="font-mono text-xs text-terminal-muted uppercase tracking-widest">
          Levels
        </span>
      </div>
      <nav className="flex-1 py-1">
        {levels.map((lvl, idx) => {
          const isActive = !isCustomLevel && idx === currentLevelIndex
          const isDone = completedLevels.includes(lvl.id)
          return (
            <button
              key={lvl.id}
              onClick={() => goToLevel(idx)}
              aria-label={`Level ${idx + 1}: ${lvl.title}${isDone ? ', completed' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              className={`
                w-full text-left px-3 py-2 flex items-center gap-2 transition-colors
                ${isActive
                  ? 'bg-terminal-green bg-opacity-10 border-r-2 border-terminal-green'
                  : 'hover:bg-terminal-bg'}
              `}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isDone
                    ? 'bg-terminal-green'
                    : difficultyDot[lvl.difficulty] ?? 'bg-terminal-muted'
                } ${isDone ? '' : 'opacity-40'}`}
              />
              <span className={`font-mono text-xs truncate ${isActive ? 'text-terminal-green font-bold' : isDone ? 'text-terminal-text' : 'text-terminal-muted'}`}>
                {idx + 1}. {lvl.title}
              </span>
              {isDone && (
                <span className="text-terminal-green text-xs ml-auto shrink-0" aria-label="completed">✓</span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
