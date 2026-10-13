import { create } from 'zustand'
import {
	persist,
	// createJSONStorage
} from 'zustand/middleware'
import { APP_THEMES, type AppTheme } from '../types/app'

export type IThemeStore = {
	themes: AppTheme[]
	activeTheme: AppTheme
	setTheme: (theme: AppTheme) => void
	isDark: boolean
	setIsDark: (isDark: boolean) => void
}

type PersistedThemeState = {
	activeTheme?: AppTheme
}

export const useThemeStore = create<IThemeStore>()(
	persist(
		(set) => ({
			themes: APP_THEMES,
			/*
			  BLyNC ships pitch-black + neon-lime as the out-of-the-box look, not
			  as one option among twenty. A fresh install has no persisted value,
			  so this is what a new user sees; anyone who has already chosen a
			  theme keeps it (the migrate() below only rewrites values that no
			  longer exist).
			*/
			activeTheme: 'blync',
			setTheme: (activeTheme: AppTheme) => set(() => ({ activeTheme })),
			isDark: false,
			setIsDark: (isDark: boolean) => set(() => ({ isDark })),
		}),
		{
			name: 'active-theme',
			version: 4,
			// storage: createJSONStorage(() => sessionStorage),
			partialize: (state) =>
				Object.fromEntries(
					Object.entries(state).filter(([key]) => key === 'activeTheme')
				),
			migrate: (persistedState, version) => {
				const state = (persistedState ?? {}) as PersistedThemeState
				const removed = new Set(['ocean', 'forest', 'high-contrast'])

				if (state.activeTheme && removed.has(state.activeTheme as string)) {
					return { activeTheme: 'auto' as const }
				}
				// Pre-v4 web defaulted to 'light'; migrate any older version to 'auto'.
				if (version < 4 && state.activeTheme === 'light') {
					return { activeTheme: 'auto' as const }
				}
				if (
					state.activeTheme &&
					!(APP_THEMES as readonly string[]).includes(state.activeTheme)
				) {
					return { activeTheme: 'auto' as AppTheme }
				}
				return state
			},
		}
	)
)
