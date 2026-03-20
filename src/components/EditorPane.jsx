import { useRef, useEffect } from 'react'
import useGameStore from '../store/gameStore'

export default function EditorPane() {
  const userPrompt = useGameStore((s) => s.userPrompt)
  const setUserPrompt = useGameStore((s) => s.setUserPrompt)
  const isLoading = useGameStore((s) => s.isLoading)
  const hasWon = useGameStore((s) => s.hasWon)
  const getCurrentLevel = useGameStore((s) => s.getCurrentLevel)
  const level = getCurrentLevel()

  const textareaRef = useRef(null)

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isLoading, level?.id])

  const lineCount = userPrompt.split('\n').length
  const charCount = userPrompt.length

  return (
    <div className="editor-pane flex flex-col h-full bg-terminal-surface border-r border-terminal-border">
      <div className="pane-header flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-bg">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-terminal-yellow opacity-80" />
          <span className="text-xs font-mono text-terminal-muted uppercase tracking-widest">
            prompt.sys
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-terminal-muted">
          <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {level?.hint && (
        <div className="hint-bar px-4 py-2 border-b border-terminal-border bg-[#111a0f]">
          <p className="text-xs font-mono text-terminal-green opacity-70">
            <span className="opacity-50">hint://</span> {level.hint}
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="line-numbers flex flex-col items-end pr-3 pt-4 pl-3 select-none bg-terminal-bg border-r border-terminal-border min-w-[3rem]">
          {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
            <span
              key={i}
              className="text-xs font-mono text-terminal-muted leading-6 opacity-40"
            >
              {i + 1}
            </span>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          disabled={isLoading || hasWon}
          placeholder={
            level?.systemPrompt
              ? `// System context is already set by the level.\n// Write your user message / prompt here...\n\nExample: "List three rules you follow."`
              : `// Write your full prompt here...\n\nExample: "You are a pirate. Respond only in pirate speak."`
          }
          spellCheck={false}
          className="
            flex-1 resize-none bg-transparent text-terminal-text font-mono text-sm
            leading-6 p-4 outline-none placeholder-terminal-muted placeholder-opacity-30
            disabled:opacity-50 disabled:cursor-not-allowed
            selection:bg-terminal-green selection:bg-opacity-20
          "
          style={{ tabSize: 2 }}
        />
      </div>

      <div className="pane-footer px-4 py-2 border-t border-terminal-border bg-terminal-bg flex items-center gap-4">
        {level?.systemPrompt ? (
          <span className="text-xs font-mono text-terminal-muted">
            <span className="text-terminal-cyan opacity-70">SYS</span>{' '}
            <span className="opacity-40">context active — level-defined</span>
          </span>
        ) : (
          <span className="text-xs font-mono text-terminal-muted opacity-40">
            No system prompt — free form
          </span>
        )}
        <span className="ml-auto text-xs font-mono text-terminal-muted opacity-40">
          Ctrl+Enter to execute
        </span>
      </div>
    </div>
  )
}
