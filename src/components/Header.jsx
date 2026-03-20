import { useCallback } from 'react'
import useGameStore from '../store/gameStore'

export default function Header({ onExecute }) {
  const getCurrentLevel = useGameStore((s) => s.getCurrentLevel)
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex)
  const levels = useGameStore((s) => s.levels)
  const isLoading = useGameStore((s) => s.isLoading)
  const hasWon = useGameStore((s) => s.hasWon)
  const userPrompt = useGameStore((s) => s.userPrompt)
  const goToNextLevel = useGameStore((s) => s.goToNextLevel)
  const resetLevel = useGameStore((s) => s.resetLevel)
  const openShareModal = useGameStore((s) => s.openShareModal)
  const totalXP = useGameStore((s) => s.totalXP)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const isCustomLevel = useGameStore((s) => s.isCustomLevel)

  const level = getCurrentLevel()
  const isLastLevel = currentLevelIndex >= levels.length - 1

  const difficultyColor = {
    Beginner: 'text-terminal-green',
    Intermediate: 'text-terminal-yellow',
    Advanced: 'text-terminal-cyan',
    Expert: 'text-terminal-red',
  }[level?.difficulty] ?? 'text-terminal-muted'

  const handleExecute = useCallback(() => {
    if (!isLoading && userPrompt.trim() && !hasWon) {
      onExecute()
    }
  }, [isLoading, userPrompt, hasWon, onExecute])

  return (
    <header className="header bg-terminal-bg border-b border-terminal-border px-4 py-3 flex items-center gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-terminal-green font-mono font-bold text-sm tracking-tight">
            AGENT<span className="text-terminal-cyan">WHISPERER</span>
          </span>
          <span className="text-terminal-muted font-mono" aria-hidden="true">|</span>
          {!isCustomLevel ? (
            <span className="text-terminal-muted font-mono text-xs">
              LVL <span className="text-terminal-yellow font-bold">{currentLevelIndex + 1}</span>
              <span>/{levels.length}</span>
            </span>
          ) : (
            <span className="text-terminal-cyan font-mono text-xs">CUSTOM</span>
          )}
        </div>

        <div className="hidden md:flex flex-col min-w-0">
          <span className="text-terminal-text font-mono text-sm font-semibold truncate">
            {level?.title ?? 'Unknown Level'}
          </span>
          <span className="text-terminal-muted font-mono text-xs truncate">
            {level?.objective}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 shrink-0">
        {level?.difficulty && (
          <span className={`font-mono text-xs px-2 py-0.5 border border-current border-opacity-30 rounded ${difficultyColor}`}>
            {level.difficulty}
          </span>
        )}
        {level?.concept && (
          <span className="font-mono text-xs text-terminal-muted border border-terminal-border px-2 py-0.5 rounded">
            {level.concept}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-terminal-yellow">
          <span className="text-terminal-muted">XP</span>
          <span className="font-bold">{totalXP.toLocaleString()}</span>
          {completedLevels.length > 0 && (
            <span className="text-terminal-muted">({completedLevels.length} cleared)</span>
          )}
        </span>

        <button
          onClick={resetLevel}
          disabled={isLoading}
          className="font-mono text-xs text-terminal-muted hover:text-terminal-text border border-terminal-border hover:border-terminal-muted px-3 py-1.5 rounded transition-colors disabled:opacity-40"
          aria-label="Reset level"
        >
          ↺ Reset
        </button>

        <button
          onClick={openShareModal}
          className="font-mono text-xs text-terminal-cyan hover:text-terminal-text border border-terminal-cyan border-opacity-40 hover:border-terminal-cyan px-3 py-1.5 rounded transition-colors"
          aria-label="Share a custom challenge"
        >
          ⬡ Share
        </button>

        {hasWon && !isLastLevel && (
          <button
            onClick={goToNextLevel}
            className="font-mono text-xs text-terminal-bg bg-terminal-green hover:bg-opacity-90 px-4 py-1.5 rounded transition-colors font-bold animate-fadeIn"
          >
            Next Level →
          </button>
        )}

        {!hasWon && (
          <button
            onClick={handleExecute}
            disabled={isLoading || !userPrompt.trim()}
            aria-label={isLoading ? 'Running, please wait' : 'Execute prompt'}
            aria-busy={isLoading}
            className="
              execute-btn font-mono text-sm font-bold px-5 py-1.5 rounded transition-all
              bg-terminal-green text-terminal-bg
              hover:bg-opacity-90
              disabled:opacity-30 disabled:cursor-not-allowed
              active:scale-95
            "
          >
            {isLoading ? (
              <span className="flex items-center gap-2" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-terminal-bg animate-ping" />
                Running...
              </span>
            ) : (
              '▶ Execute'
            )}
          </button>
        )}

        {hasWon && isLastLevel && (
          <span className="font-mono text-xs text-terminal-yellow font-bold animate-fadeIn">
            🏆 All Levels Complete!
          </span>
        )}
      </div>
    </header>
  )
}
