import { useId } from 'react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import type { TransferProgress } from '../../types/transfer'
import { formatFileSize } from '../../lib/utils'
import {
	clampPercentage,
	formatSpeed,
	hasReportableEta,
	hasReportableSpeed,
	resolveTransferPhase,
} from '../../lib/transfer-progress'
import { formatETA } from '../../utils/etaUtils'

/**
 * The circular transfer indicator, shared by Send and Receive.
 *
 * Everything drawn here comes from the engine. The wire format for both
 * directions is `<bytesDone>:<bytesTotal>:<speedBps*1000>`, emitted by
 * `engine/protocol/src/{send,receive}.rs` and parsed once in
 * `lib/transfer-events.ts`. Nothing is interpolated, eased toward a target, or
 * invented locally, so a stalled transfer reads as stalled instead of crawling.
 *
 * Two rules this component will not bend:
 *
 * 1. A finished ring and a success state appear only when the engine emitted
 *    `transfer-completed` / `receive-completed`. Reaching 100% of the byte
 *    count is not the same thing and does not draw one.
 * 2. There is no pause. The engine has no pause - `stop_sharing` tears the
 *    session down and `cancel_receive` abandons the download while preserving
 *    a partial store - so no control here implies otherwise.
 *
 * The phase and readout decisions live in `lib/transfer-progress.ts` so they
 * can be tested without a DOM.
 */

export interface TransferProgressRingProps {
	progress: TransferProgress | null
	/** Engine-confirmed completion. Never inferred from the byte count. */
	isComplete?: boolean
	/** Engine-reported failure, shown verbatim. */
	error?: string
	isCancelled?: boolean
	/**
	 * Name of what is moving, when the interface genuinely knows it - the sender
	 * knows what it selected, and the receiver learns the names once the
	 * download finishes. Left blank rather than guessed when neither is true.
	 */
	fileName?: string
	/** Total files, when the interface knows it. */
	fileCount?: number
	/** Accessible name for the region, e.g. "Transfer progress". */
	label?: string
	/** Compact form for the narrow send card. */
	compact?: boolean
}

const RING_SIZE = 200
const CENTER = RING_SIZE / 2
const RADIUS = 84
const STROKE_WIDTH = 6

const SEGMENT_COUNT = 18
const SEGMENT_KEYS = Array.from(
	{ length: SEGMENT_COUNT },
	(_, i) => `segment-${i}`
)
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT
const GAP_ANGLE = 2.5
const ARC_ANGLE = SEGMENT_ANGLE - GAP_ANGLE * 2

/**
 * A ring segment, as an SVG arc path.
 *
 * Angles run clockwise from twelve o'clock so a filled ring reads the way a
 * progress bar does: from the top, forward.
 */
function arcPath(startAngle: number, sweep: number): string {
	const toPoint = (angleDeg: number) => {
		const rad = ((angleDeg - 90) * Math.PI) / 180
		return {
			x: CENTER + RADIUS * Math.cos(rad),
			y: CENTER + RADIUS * Math.sin(rad),
		}
	}
	const start = toPoint(startAngle)
	const end = toPoint(startAngle + sweep)
	const largeArc = sweep > 180 ? 1 : 0
	return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export function TransferProgressRing({
	progress,
	isComplete = false,
	error = '',
	isCancelled = false,
	fileName = '',
	fileCount,
	label,
	compact = false,
}: TransferProgressRingProps) {
	const { t } = useTranslation()
	const gradientId = useId()

	const phase = resolveTransferPhase(progress, {
		isComplete,
		error,
		isCancelled,
	})

	const doneBytes = progress?.bytesTransferred ?? 0
	const totalBytes = progress?.totalBytes ?? 0
	const determinate = phase === 'transferring'
	const percentage = determinate ? clampPercentage(progress) : 0

	// Speed and ETA are only meaningful once bytes are actually moving and the
	// engine has a total to work towards.
	const showSpeed = determinate && hasReportableSpeed(progress)
	const showEta = hasReportableEta(progress, phase)

	const filledSegments = Math.floor((percentage / 100) * SEGMENT_COUNT)
	const partialFraction =
		determinate && percentage % (100 / SEGMENT_COUNT) > 0
			? (percentage % (100 / SEGMENT_COUNT)) / (100 / SEGMENT_COUNT)
			: 0

	const accessibleName = label ?? t('common:transfer.progress')

	// Announced text carries the same facts the ring draws, so a screen-reader
	// user gets the number, the ratio and the speed rather than a bare "50%".
	const valueText = (() => {
		switch (phase) {
			case 'complete':
				return t('common:transfer.complete')
			case 'error':
				return error || t('common:transfer.failed')
			case 'cancelled':
				return t('common:transfer.cancelled')
			case 'indeterminate':
				return t('common:transfer.indeterminate')
			default:
				return `${percentage.toFixed(0)}% — ${formatFileSize(doneBytes)} of ${formatFileSize(totalBytes)}${
					showSpeed ? ` — ${formatSpeed(progress?.speedBps ?? 0)}` : ''
				}${showEta ? ` — ${t('common:transfer.eta')} ${formatETA(progress?.etaSeconds ?? 0)}` : ''}`
		}
	})()

	const centreLabel = (() => {
		switch (phase) {
			case 'complete':
				return (
					<svg
						viewBox="0 0 24 24"
						className="size-11 text-[var(--blync-lime)]"
						aria-hidden="true"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				)
			case 'error':
				return (
					<svg
						viewBox="0 0 24 24"
						className="size-10 text-destructive"
						aria-hidden="true"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M12 8v5M12 17h.01" />
						<circle cx="12" cy="12" r="9" />
					</svg>
				)
			case 'cancelled':
				return (
					<svg
						viewBox="0 0 24 24"
						className="size-9 text-muted-foreground"
						aria-hidden="true"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						strokeLinecap="round"
					>
						<rect x="6" y="6" width="12" height="12" rx="1.5" />
					</svg>
				)
			case 'indeterminate':
				// No percentage: the engine has not reported a total, so any
				// number here would be a guess.
				return (
					<span className="text-lg text-muted-foreground tabular-nums">
						&mdash;
					</span>
				)
			default:
				return (
					<span className="text-3xl font-semibold leading-none tabular-nums text-[var(--blync-lime)]">
						{percentage.toFixed(0)}
						<span className="text-lg align-top">%</span>
					</span>
				)
		}
	})()

	return (
		<div className="flex flex-col items-center gap-3 select-none">
			<div
				className="relative inline-flex items-center justify-center rounded-full"
				style={{
					backgroundColor: 'var(--blync-void)',
					width: compact ? RING_SIZE * 0.72 : RING_SIZE,
					height: compact ? RING_SIZE * 0.72 : RING_SIZE,
				}}
			>
				<svg
					viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
					width="100%"
					height="100%"
					role="progressbar"
					aria-label={accessibleName}
					/*
					  ARIA: a determinate progressbar carries aria-valuenow; an
					  indeterminate one deliberately omits it, which is how a
					  screen reader is told the value is unknown rather than 0.
					*/
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={determinate ? Math.round(percentage) : undefined}
					aria-valuetext={valueText}
					className="block shrink-0"
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="var(--blync-lime)" />
							<stop offset="100%" stopColor="var(--blync-blue)" />
						</linearGradient>
					</defs>

					{SEGMENT_KEYS.map((segmentKey, index) => {
						const startAngle = index * SEGMENT_ANGLE + GAP_ANGLE
						const arcD = arcPath(startAngle, ARC_ANGLE)
						const isFilled = determinate && index < filledSegments
						const isPartial =
							determinate && index === filledSegments && partialFraction > 0

						return (
							<g key={segmentKey}>
								<path
									d={arcD}
									fill="none"
									stroke="var(--blync-surface-2)"
									strokeWidth={STROKE_WIDTH}
									strokeLinecap="butt"
								/>
								{isFilled && (
									<path
										d={arcD}
										fill="none"
										stroke={
											index === 0 ? `url(#${gradientId})` : 'var(--blync-lime)'
										}
										strokeWidth={STROKE_WIDTH}
										strokeLinecap="butt"
									/>
								)}
								{isPartial && (
									<path
										d={arcD}
										fill="none"
										stroke="var(--blync-lime)"
										strokeWidth={STROKE_WIDTH}
										strokeLinecap="butt"
										pathLength={100}
										strokeDasharray="100"
										strokeDashoffset={100 - partialFraction * 100}
										className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
									/>
								)}
							</g>
						)
					})}

					{/*
					  The leading head while a determinate transfer runs: one
					  thunder-blue segment at the frontier, so the eye can find
					  where the ring has got to.
					*/}
					{determinate && filledSegments < SEGMENT_COUNT && (
						<path
							d={arcPath(filledSegments * SEGMENT_ANGLE + GAP_ANGLE, ARC_ANGLE)}
							fill="none"
							stroke="var(--blync-blue)"
							strokeWidth={STROKE_WIDTH}
							strokeLinecap="butt"
							opacity={partialFraction > 0 ? 0 : 0.9}
						/>
					)}

					{/*
					  Indeterminate head. The group rotates about the viewBox
					  centre so the segment travels the ring; `transform-box:
					  view-box` is what makes the origin resolve to the ring's
					  centre rather than the segment's own bounding box. Under
					  reduced motion the animation is dropped and the segment
					  simply sits at the top - still visible, no movement.
					*/}
					{phase === 'indeterminate' && (
						<g
							style={{
								transformOrigin: `${CENTER}px ${CENTER}px`,
								transformBox: 'view-box',
							}}
							className="motion-safe:animate-blync-ring-sweep motion-reduce:animate-none"
						>
							<path
								d={arcPath(GAP_ANGLE, ARC_ANGLE * 2)}
								fill="none"
								stroke="var(--blync-blue)"
								strokeWidth={STROKE_WIDTH}
								strokeLinecap="butt"
							/>
						</g>
					)}
				</svg>

				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-6 text-center">
					{centreLabel}
					{determinate && showSpeed && (
						<span className="text-xs text-muted-foreground tabular-nums">
							{formatSpeed(progress?.speedBps ?? 0)}
						</span>
					)}
					{phase === 'indeterminate' && (
						<span className="text-xs text-muted-foreground">
							{t('common:transfer.working')}
						</span>
					)}
				</div>
			</div>

			{/* Facts that do not fit inside the ring. */}
			<div className="flex w-full flex-col items-center gap-0.5 text-center">
				{fileName && (
					<span
						className="max-w-[18rem] truncate text-sm font-medium text-foreground"
						title={fileName}
					>
						{fileName}
					</span>
				)}
				{fileName && fileCount !== undefined && fileCount > 1 && (
					<span className="text-xs text-muted-foreground">
						{t('common:transfer.fileCount', { count: fileCount })}
					</span>
				)}

				{determinate && (
					<span className="text-xs text-muted-foreground tabular-nums">
						{formatFileSize(doneBytes)} / {formatFileSize(totalBytes)}
					</span>
				)}
				{showEta && (
					<span className="text-xs text-muted-foreground tabular-nums">
						{t('common:transfer.eta')}: {formatETA(progress?.etaSeconds ?? 0)}
					</span>
				)}

				{phase === 'complete' && (
					<span
						className="text-xs font-medium text-[var(--blync-lime)]"
						aria-live="polite"
					>
						{t('common:transfer.complete')}
					</span>
				)}
				{phase === 'error' && (
					<span className="text-xs text-destructive" aria-live="assertive">
						{error || t('common:transfer.failed')}
					</span>
				)}
				{phase === 'cancelled' && (
					<span className="text-xs text-muted-foreground" aria-live="polite">
						{t('common:transfer.cancelled')}
					</span>
				)}
			</div>
		</div>
	)
}
