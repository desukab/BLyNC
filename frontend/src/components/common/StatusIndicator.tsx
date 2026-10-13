import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface StatusIndicatorProps {
	isCompleted: boolean
	isTransporting: boolean
	statusText: string
	activeConnectionCount?: number
	isBroadcastMode?: boolean
}

export function StatusIndicator({
	isCompleted,
	isTransporting,
	statusText,
	activeConnectionCount = 0,
	isBroadcastMode = false,
}: StatusIndicatorProps) {
	const { t } = useTranslation()
	// In broadcast mode, show the live connection count once anyone is actually
	// pulling; below that the sender's own status text is the more useful line.
	const hasActiveConnections = isBroadcastMode && activeConnectionCount > 0
	const displayStatusText = hasActiveConnections
		? t(
				activeConnectionCount === 1
					? 'common:sender.activeTransfer'
					: 'common:sender.activeTransfers',
				{ count: activeConnectionCount }
			)
		: statusText

	// Semantic tokens rather than a fixed hue: `success` is the one that stays
	// legible in all nineteen palettes, and it is the only status colour the
	// design language spends a hue on.
	const isLive = isCompleted || hasActiveConnections || isTransporting

	return (
		<div className="mb-2 flex items-center gap-2">
			<span
				aria-hidden
				className={cn(
					'size-2 shrink-0 rounded-full bg-muted-foreground/60',
					'before:absolute before:inset-0 before:animate-ping before:rounded-full before:opacity-75',
					isLive ? 'bg-success before:bg-success' : 'before:bg-muted-foreground'
				)}
			/>
			<p
				className={cn(
					'text-sm font-medium text-foreground',
					isLive && 'text-success'
				)}
				aria-live="polite"
			>
				{displayStatusText}
			</p>
		</div>
	)
}
