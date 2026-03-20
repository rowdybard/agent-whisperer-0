import { create } from 'zustand'
import coreLevels from '../data/coreLevels.json'

const useGameStore = create((set, get) => ({
  levels: coreLevels,
  currentLevelIndex: 0,
  userPrompt: '',
  aiOutput: '',
  isLoading: false,
  hasWon: false,
  hasError: false,
  errorMessage: '',
  isCustomLevel: false,
  customLevel: null,
  totalXP: 0,
  completedLevels: [],
  showShareModal: false,

  getCurrentLevel: () => {
    const { isCustomLevel, customLevel, levels, currentLevelIndex } = get()
    return isCustomLevel ? customLevel : levels[currentLevelIndex]
  },

  setUserPrompt: (prompt) => set({ userPrompt: prompt }),

  setAiOutput: (output) => set({ aiOutput: output }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (message) => set({ hasError: true, errorMessage: message, isLoading: false }),

  clearError: () => set({ hasError: false, errorMessage: '' }),

  setWon: () => {
    const state = get()
    const level = state.getCurrentLevel()
    const alreadyCompleted = state.completedLevels.includes(level?.id)
    set({
      hasWon: true,
      totalXP: alreadyCompleted ? state.totalXP : state.totalXP + (level?.xp ?? 0),
      completedLevels: alreadyCompleted
        ? state.completedLevels
        : [...state.completedLevels, level?.id],
    })
  },

  goToNextLevel: () => {
    const { currentLevelIndex, levels } = get()
    if (currentLevelIndex < levels.length - 1) {
      set({
        currentLevelIndex: currentLevelIndex + 1,
        userPrompt: '',
        aiOutput: '',
        hasWon: false,
        hasError: false,
        errorMessage: '',
        isLoading: false,
        isCustomLevel: false,
        customLevel: null,
      })
    }
  },

  goToLevel: (index) => {
    const { levels } = get()
    if (index >= 0 && index < levels.length) {
      set({
        currentLevelIndex: index,
        userPrompt: '',
        aiOutput: '',
        hasWon: false,
        hasError: false,
        errorMessage: '',
        isLoading: false,
        isCustomLevel: false,
        customLevel: null,
      })
    }
  },

  loadCustomLevel: (levelData) => {
    set({
      isCustomLevel: true,
      customLevel: levelData,
      userPrompt: '',
      aiOutput: '',
      hasWon: false,
      hasError: false,
      errorMessage: '',
      isLoading: false,
    })
  },

  resetLevel: () => {
    set({
      userPrompt: '',
      aiOutput: '',
      hasWon: false,
      hasError: false,
      errorMessage: '',
      isLoading: false,
    })
  },

  openShareModal: () => set({ showShareModal: true }),
  closeShareModal: () => set({ showShareModal: false }),
}))

export default useGameStore
