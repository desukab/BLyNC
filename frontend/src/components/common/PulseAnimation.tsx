import { useLottie } from 'lottie-react'
import pulseAnimationOriginal from '../../assets/pulse.json'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { resolveCssColor } from '@/lib/cssColor'
import { useThemeStore } from '@/store'

interface PulseAnimationProps {
	isTransporting: boolean
	hasActiveConnections?: boolean
	className?: string
	size?: number
}

/** Pre-theme fallback, kept so a colour we cannot parse never renders black. */
const FALLBACK_ACTIVE: [number, number, number, number] = [0.714, 1, 0, 0.687]
const FALLBACK_IDLE: [number, number, number, number] = [0.63, 0.66, 0.61, 0.9]

function modifyAnimationColor(animationData: any, color: number[]) {
	const cloned = JSON.parse(JSON.stringify(animationData))

	if (cloned.assets?.[0]?.layers) {
		cloned.assets[0].layers.forEach((layer: any) => {
			if (layer.shapes) {
				layer.shapes.forEach((shape: any) => {
					if (shape.it) {
						shape.it.forEach((item: any) => {
							if (item.ty === 'fl' && item.c && item.c.k) {
								item.c.k = color
							}
						})
					}
				})
			}
		})
	}

	return cloned
}

export function PulseAnimation({
	isTransporting,
	hasActiveConnections = false,
	className = '',
	size = 180,
}: PulseAnimationProps) {
	// Lottie cannot read a CSS variable, so the colour is sampled out of the
	// document. That also means it has to be re-sampled when the theme changes,
	// or a user who switches palette mid-transfer keeps the previous hue.
	const activeTheme = useThemeStore((state) => state.activeTheme)

	// biome-ignore lint/correctness/useExhaustiveDependencies: activeTheme is not read as a value, it signals that the DOM custom properties changed and resolveCssColor must re-sample them
	const animationData = useMemo(() => {
		const active = isTransporting || hasActiveConnections
		const color = active
			? (resolveCssColor('--primary') ?? FALLBACK_ACTIVE)
			: (resolveCssColor('--muted-foreground') ?? FALLBACK_IDLE)

		return modifyAnimationColor(pulseAnimationOriginal, color)
	}, [isTransporting, hasActiveConnections, activeTheme])

	const { View } = useLottie({
		animationData,
		loop: true,
		autoplay: true,
		style: { width: '100%', height: '100%' },
	})

	return (
		<div
			className={cn(className, isTransporting && 'max-sm:hidden')}
			style={{ width: size, height: size }}
		>
			{View}
		</div>
	)
}
