import { useEffect, useRef } from 'react'
import useGameStore from '../store/gameStore'
import { validateOutput } from '../utils/validator'

export default function OutputPane() {
  const aiOutput = useGameStore((s) => s.aiOutput)
  const isLoading = useGameStore((s) => s.isLoading)
  const hasWon = useGameStore((s) => s.hasWon)
  const hasError = useGameStore((s) => s.hasError)
  const errorMessage = useGameStore((s) => s.errorMessage)
  const setWon = useGameStore((s) => s.setWon)
  const getCurrentLevel = useGameStore((s) => s.getCurrentLevel)
  const level = getCurrentLevel()

  const outputRef = useRef(null)

  const validation = aiOutput && level?.winCondition
    ? validateOutput(aiOutput, level.winCondition)
    : null

  useEffect(() => {
    if (validation?.passed && !hasWon) {
      setWon()
    }
  }, [validation?.passed, hasWon, setWon])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [aiOutput, isLoading])

  return (
    <div className="output-pane flex flex-col h-full bg-terminal-bg">
      <div className="pane-header flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-surface">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${hasWon ? 'bg-terminal-green animate-pulse' : hasError ? 'bg-terminal-red' : 'bg-terminal-muted opacity-50'}`} />
          <span className="text-xs font-mono text-terminal-muted uppercase tracking-widest">
            agent.out
          </span>
        </div>
        {validation && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${validation.passed ? 'text-terminal-green bg-terminal-green bg-opacity-10 border border-terminal-green border-opacity-30' : 'text-terminal-red bg-terminal-red bg-opacity-10 border border-terminal-red border-opacity-30'}`}>
            {validation.passed ? '✓ WIN CONDITION MET' : '✗ NOT YET'}
          </span>
        )}
      </div>

      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
        aria-live="polite"
        aria-label="Agent output"
      >
        {!aiOutput && !isLoading && !hasError && (
          <div className="flex flex-col items-start gap-1 animate-fadeIn" aria-label="Awaiting prompt">
            <span className="text-terminal-green">$ agent --await-input</span>
            <span className="text-terminal-muted">Waiting for prompt execution...</span>
            <span className="text-terminal-muted flex items-center gap-1">
              <span className="w-2 h-4 bg-terminal-green opacity-70 animate-blink inline-block" />
            </span>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col gap-2 animate-fadeIn">
            <span className="text-terminal-cyan text-xs">$ calling agent...</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-terminal-green animate-blink text-lg leading-none">█</span>
              <span className="text-terminal-muted text-xs">processing</span>
            </div>
            <div className="mt-2 space-y-1">
              {[80, 60, 90, 45].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded bg-terminal-border animate-pulse"
                  style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {hasError && !isLoading && (
          <div className="animate-fadeIn">
            <p className="text-terminal-red font-mono text-xs mb-1">$ error://</p>
            <p className="text-terminal-red font-mono">{errorMessage}</p>
          </div>
        )}

        {aiOutput && !isLoading && (
          <div className="animate-slideUp">
            <span className="text-terminal-cyan text-xs mb-3">$ agent response ↓</span>
            <pre className="text-terminal-text whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
              {aiOutput}
            </pre>

            {validation && (
              <div className={`mt-6 border-t pt-4 ${validation.passed ? 'border-terminal-green border-opacity-30' : 'border-terminal-border'}`}>
                <p className={`text-xs font-mono ${validation.passed ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {validation.passed ? '✓' : '✗'} {validation.message}
                </p>

                {validation.passed && (
                  <div className="mt-3 p-3 bg-terminal-green bg-opacity-5 border border-terminal-green border-opacity-20 rounded animate-fadeIn">
                    <p className="text-terminal-green text-sm font-mono font-bold">
                      🏆 Level Complete! +{level?.xp ?? 0} XP
                    </p>
                    <p className="text-terminal-muted text-xs mt-1 font-mono">
                      You've mastered: {level?.concept}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pane-footer px-4 py-2 border-t border-terminal-border bg-terminal-surface flex items-center gap-3">
        <span className="text-xs font-mono text-terminal-muted">
          {aiOutput ? `${aiOutput.length} chars` : '0 chars'}
        </span>
        {level?.winCondition && (
          <span className="text-xs font-mono text-terminal-muted ml-auto">
            win.type: <span className="text-terminal-cyan">{level.winCondition.type}</span>
          </span>
        )}
      </div>
    </div>
  )
}
