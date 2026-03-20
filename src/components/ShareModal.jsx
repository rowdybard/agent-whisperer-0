import { useState, useCallback } from 'react'
import useGameStore from '../store/gameStore'
import { generateShareURL, encodeLevel } from '../utils/encoder'

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const WIN_TYPES = ['exact', 'contains', 'notContains', 'regex', 'json']

const DEFAULT_FORM = {
  title: '',
  concept: '',
  difficulty: 'Beginner',
  objective: '',
  description: '',
  systemPrompt: '',
  hint: '',
  xp: 250,
  winCondition: {
    type: 'contains',
    value: '',
    flags: 'i',
    minMatches: 1,
    requiredKeys: '',
  },
}

export default function ShareModal() {
  const showShareModal = useGameStore((s) => s.showShareModal)
  const closeShareModal = useGameStore((s) => s.closeShareModal)
  const loadCustomLevel = useGameStore((s) => s.loadCustomLevel)

  const [form, setForm] = useState(DEFAULT_FORM)
  const [shareURL, setShareURL] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('create')

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateWin = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, winCondition: { ...prev.winCondition, [field]: value } }))
  }, [])

  const buildLevelObject = useCallback(() => {
    const { winCondition, ...rest } = form
    const wc = { type: winCondition.type }

    if (winCondition.type === 'json') {
      wc.requiredKeys = winCondition.requiredKeys
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (winCondition.type === 'regex') {
      wc.value = winCondition.value
      wc.flags = winCondition.flags || 'i'
      wc.minMatches = Number(winCondition.minMatches) || 1
    } else {
      wc.value = winCondition.value
    }

    return { ...rest, winCondition: wc, id: `custom-${Date.now()}` }
  }, [form])

  const handleGenerate = useCallback(() => {
    const level = buildLevelObject()
    const url = generateShareURL(level)
    if (url) {
      setShareURL(url)
      setActiveTab('share')
    }
  }, [buildLevelObject])

  const handlePlayNow = useCallback(() => {
    const level = buildLevelObject()
    loadCustomLevel(level)
    closeShareModal()
    setForm(DEFAULT_FORM)
    setShareURL('')
    setActiveTab('create')
  }, [buildLevelObject, loadCustomLevel, closeShareModal])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareURL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = shareURL
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareURL])

  const handleClose = useCallback(() => {
    closeShareModal()
    setActiveTab('create')
  }, [closeShareModal])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') handleClose()
  }, [handleClose])

  if (!showShareModal) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="modal-box bg-terminal-surface border border-terminal-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black"
        role="dialog"
        aria-modal="true"
        aria-label="Challenge Builder"
      >
        <div className="modal-header flex items-center justify-between px-5 py-3 border-b border-terminal-border bg-terminal-bg rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className="text-terminal-cyan font-mono font-bold text-sm"> CHALLENGE BUILDER</span>
            <div className="flex gap-1" role="tablist" aria-label="Challenge builder tabs">
              {['create', 'share'].map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-mono text-xs px-3 py-1 rounded transition-colors ${
                    activeTab === tab
                      ? 'bg-terminal-green text-terminal-bg font-bold'
                      : 'text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-terminal-muted hover:text-terminal-text font-mono text-lg leading-none transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {activeTab === 'create' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title" required>
                  <input
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="My Evil Prompt Challenge"
                    className={inputClass}
                  />
                </Field>
                <Field label="Concept">
                  <input
                    value={form.concept}
                    onChange={(e) => update('concept', e.target.value)}
                    placeholder="e.g. Role Assignment"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Difficulty">
                  <select
                    value={form.difficulty}
                    onChange={(e) => update('difficulty', e.target.value)}
                    className={inputClass}
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="XP Reward">
                  <input
                    type="number"
                    value={form.xp}
                    onChange={(e) => update('xp', Number(e.target.value))}
                    min={50}
                    max={9999}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Objective" required>
                <input
                  value={form.objective}
                  onChange={(e) => update('objective', e.target.value)}
                  placeholder="Make the AI say exactly: 'You shall not pass!'"
                  className={inputClass}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Explain the concept this level teaches..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field label="System Prompt (optional)">
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) => update('systemPrompt', e.target.value)}
                  placeholder="You are a helpful assistant."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field label="Hint (optional)">
                <input
                  value={form.hint}
                  onChange={(e) => update('hint', e.target.value)}
                  placeholder="Try using 'You are...' phrasing."
                  className={inputClass}
                />
              </Field>

              <div className="border border-terminal-border rounded p-4 space-y-3 bg-terminal-bg">
                <p className="font-mono text-xs text-terminal-cyan uppercase tracking-widest">Win Condition</p>

                <Field label="Type">
                  <select
                    value={form.winCondition.type}
                    onChange={(e) => updateWin('type', e.target.value)}
                    className={inputClass}
                  >
                    {WIN_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                {form.winCondition.type !== 'json' && (
                  <Field label={form.winCondition.type === 'regex' ? 'Regex Pattern' : 'Value'} required>
                    <input
                      value={form.winCondition.value}
                      onChange={(e) => updateWin('value', e.target.value)}
                      placeholder={
                        form.winCondition.type === 'regex'
                          ? '(hello|hi|hey)'
                          : 'Expected text...'
                      }
                      className={inputClass}
                    />
                  </Field>
                )}

                {form.winCondition.type === 'regex' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Flags">
                      <input
                        value={form.winCondition.flags}
                        onChange={(e) => updateWin('flags', e.target.value)}
                        placeholder="i"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Min Matches">
                      <input
                        type="number"
                        value={form.winCondition.minMatches}
                        onChange={(e) => updateWin('minMatches', Number(e.target.value))}
                        min={1}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}

                {form.winCondition.type === 'json' && (
                  <Field label="Required Keys (comma-separated)" required>
                    <input
                      value={form.winCondition.requiredKeys}
                      onChange={(e) => updateWin('requiredKeys', e.target.value)}
                      placeholder="name, age, email"
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-5 animate-fadeIn">
              {shareURL ? (
                <>
                  <div className="p-4 bg-terminal-bg border border-terminal-green border-opacity-30 rounded">
                    <p className="font-mono text-xs text-terminal-green mb-2">
                      ✓ Challenge URL generated:
                    </p>
                    <p className="font-mono text-xs text-terminal-text break-all leading-relaxed">
                      {shareURL}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 font-mono text-sm py-2 border rounded transition-colors border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:bg-opacity-10"
                    >
                      {copied ? '✓ Copied!' : '⧉ Copy Link'}
                    </button>
                    <button
                      onClick={handlePlayNow}
                      className="flex-1 font-mono text-sm py-2 bg-terminal-green text-terminal-bg rounded font-bold hover:bg-opacity-90 transition-colors"
                    >
                      ▶ Play Now
                    </button>
                  </div>

                  <div className="p-3 bg-terminal-bg border border-terminal-border rounded">
                    <p className="font-mono text-xs text-terminal-muted mb-1">Encoded payload:</p>
                    <p className="font-mono text-xs text-terminal-muted break-all">
                      {encodeLevel({ ...buildLevelObject() })}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="font-mono text-terminal-muted">
                    Fill out the Create tab and generate a URL first.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer px-5 py-3 border-t border-terminal-border bg-terminal-bg rounded-b-lg flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="font-mono text-xs text-terminal-muted hover:text-terminal-text border border-terminal-border px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!form.title || !form.objective || (!form.winCondition.value && form.winCondition.type !== 'json')}
            className="font-mono text-sm font-bold px-5 py-2 bg-terminal-cyan text-terminal-bg rounded hover:bg-opacity-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Generate URL →
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-xs text-terminal-muted">
        {label}{required && <span className="text-terminal-red ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'bg-terminal-bg border border-terminal-border text-terminal-text font-mono text-sm px-3 py-2 rounded outline-none focus:border-terminal-cyan focus:border-opacity-60 transition-colors placeholder-terminal-muted placeholder-opacity-30'
