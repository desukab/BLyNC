import { cn } from '@/lib/utils'

/**
 * The BLyNC mark: a 7x7 dot-matrix "B" whose right stem throws two beams off
 * to the right — the send/receive half of the product, drawn in the language
 * of the display.
 *
 * The glyph is authored as geometry rather than set in a dot-matrix typeface.
 * A display face like this one is licensed per foundry and cannot be
 * redistributed inside an AGPL app binary the way an SVG can, and hand-placing
 * the dots also means the mark stays crisp from a 16px launcher badge up to a
 * 512px store listing.
 */

type Dot = { id: string; x: number; y: number; beam?: boolean }

/** Lit dots, precomputed so the grid never becomes a React index key. */
const DOTS: readonly Dot[] = [
	{ id: 'a', x: 0, y: 0 },
	{ id: 'b', x: 1, y: 0 },
	{ id: 'c', x: 2, y: 0 },
	{ id: 'd', x: 3, y: 0 },
	{ id: 'e', x: 4, y: 0 },
	{ id: 'f', x: 0, y: 1 },
	{ id: 'g', x: 4, y: 1 },
	{ id: 'h', x: 5, y: 1, beam: true },
	{ id: 'i', x: 6, y: 1, beam: true },
	{ id: 'j', x: 0, y: 2 },
	{ id: 'k', x: 4, y: 2 },
	{ id: 'l', x: 0, y: 3 },
	{ id: 'm', x: 1, y: 3 },
	{ id: 'n', x: 2, y: 3 },
	{ id: 'o', x: 3, y: 3 },
	{ id: 'p', x: 4, y: 3 },
	{ id: 'q', x: 0, y: 4 },
	{ id: 'r', x: 4, y: 4 },
	{ id: 's', x: 5, y: 4, beam: true },
	{ id: 't', x: 6, y: 4, beam: true },
	{ id: 'u', x: 0, y: 5 },
	{ id: 'v', x: 4, y: 5 },
	{ id: 'w', x: 0, y: 6 },
	{ id: 'x', x: 1, y: 6 },
	{ id: 'y', x: 2, y: 6 },
	{ id: 'z', x: 3, y: 6 },
	{ id: 'A', x: 4, y: 6 },
] as const

export type BlyncMarkProps = Omit<
	React.SVGProps<SVGSVGElement>,
	'children' | 'viewBox'
> & {
	/** CSS colour for the letterform. Defaults to the brand lime. */
	color?: string
	/** CSS colour the beams fade toward. Defaults to thunder blue. */
	beamColor?: string
}

export function BlyncMark({
	className,
	color = 'var(--blync-lime)',
	beamColor = 'var(--blync-blue)',
	...props
}: BlyncMarkProps) {
	const gap = 0.16
	const dot = 1 - gap
	const id = 'blync-mark-beam'

	return (
		<svg
			viewBox="0 0 7 7"
			role="img"
			aria-label="BLyNC"
			className={cn('size-5', className)}
			fill="none"
			shapeRendering="geometricPrecision"
			{...props}
		>
			<defs>
				{/*
				  `userSpaceOnUse` keeps the fade in the same coordinate space as
				  the dots; the default objectBoundingBox space is recalculated
				  per path, which would break the beam across its own dots.
				*/}
				<linearGradient
					id={id}
					x1="4"
					y1="0"
					x2="7"
					y2="0"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor={beamColor} stopOpacity="0.9" />
					<stop offset="1" stopColor={beamColor} stopOpacity="0.62" />
				</linearGradient>
			</defs>
			{DOTS.map(({ id: key, x, y, beam }) => (
				<rect
					key={key}
					x={x + gap / 2}
					y={y + gap / 2}
					width={dot}
					height={dot}
					rx={dot * 0.34}
					fill={beam ? `url(#${id})` : color}
				/>
			))}
		</svg>
	)
}
