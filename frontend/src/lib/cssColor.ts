/**
 * Reads a CSS custom property off the document root as an `[r, g, b, a]`
 * array, for feeding canvas/Lottie/WebGL colour APIs that cannot take a
 * `var(--token)`.
 *
 * Handles the notations the theme files actually use — `#rgb`, `#rrggbb`,
 * `#rrggbbaa`, `rgb()`/`rgba()` — and returns `null` for anything else
 * (`oklch()`, `color-mix()`) so callers can decide on their own fallback
 * instead of silently painting black.
 */
export function resolveCssColor(
	token: string,
	element: Element = document.documentElement
): [number, number, number, number] | null {
	const raw = getComputedStyle(element).getPropertyValue(token).trim()
	if (!raw) return null

	if (raw.startsWith('#')) {
		const hex = raw.slice(1)
		const expand = (part: string) => parseInt(part.repeat(2), 16)
		if (hex.length === 3 || hex.length === 4) {
			return [
				expand(hex[0]) / 255,
				expand(hex[1]) / 255,
				expand(hex[2]) / 255,
				hex.length === 4 ? expand(hex[3]) / 255 : 1,
			]
		}
		if (hex.length === 6 || hex.length === 8) {
			return [
				parseInt(hex.slice(0, 2), 16) / 255,
				parseInt(hex.slice(2, 4), 16) / 255,
				parseInt(hex.slice(4, 6), 16) / 255,
				hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
			]
		}
		return null
	}

	const fn = raw.match(/^rgba?\(([^)]+)\)$/i)
	if (fn) {
		const parts = fn[1].split(/[\s,/]+/).filter(Boolean)
		if (parts.length < 3) return null
		const channel = (value: string) =>
			(value.endsWith('%')
				? parseFloat(value) / 100
				: parseFloat(value) / 255) || 0
		return [
			channel(parts[0]),
			channel(parts[1]),
			channel(parts[2]),
			parts.length > 3 ? parseFloat(parts[3]) || 1 : 1,
		]
	}

	return null
}
