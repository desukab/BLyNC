import { IS_ANDROID } from './platform'
import { invoke } from './platform-api'

/**
 * Keeps the Android status and navigation bar icons readable against whatever
 * the web layer is painting.
 *
 * The activity turns on edge-to-edge once, at creation, and Android picks the
 * bar icon tint from the *system* dark mode at that moment. The app's own
 * appearance is independent of the system's — the Send screen can be light
 * while the phone is in dark mode — so the two disagree and the clock ends up
 * drawn in near-black over a near-white bar. Restating the choice here is the
 * only thing that keeps the bars legible in every theme.
 */
export function applyAndroidSystemBarTheme(dark: boolean): void {
	if (!IS_ANDROID) return

	void invoke('plugin:native-utils|set_system_bar_theme', {
		args: { dark },
	}).catch((error) => {
		// Cosmetic only: a rejected call must never surface as an app error.
		console.error('Failed to apply the Android system bar theme:', error)
	})
}
