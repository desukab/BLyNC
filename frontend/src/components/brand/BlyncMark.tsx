import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * The BLyNC mark: a solid geometric "B" whose right bowls throw two signal
 * beams — the send/receive half of the product, drawn in a hint of thunder
 * blue against the brand lime.
 *
 * The letterform is authored as geometry rather than set in a face. A display
 * font is licensed per foundry and cannot be redistributed inside an AGPL app
 * the way an SVG can, and the same unit box is what the launcher icon set is
 * rendered from (see the icon generator), so the two never drift apart.
 *
 * One 0..100 unit box: the "B" spans x 20..78, y 18..82; the beams travel out
 * to x ~98. The counters are punched with a luminance mask so the mark stays
 * transparent on any surface.
 */

const STEM = { x: 20, y: 18, w: 18, h: 64, r: 4 }
const UPPER_BOWL = { x: 20, y: 18, w: 54, h: 31, r: 15.5 }
const LOWER_BOWL = { x: 20, y: 51, w: 58, h: 31, r: 15.5 }
const UPPER_COUNTER = { x: 38, y: 27, w: 24, h: 15, r: 7.5 }
const LOWER_COUNTER = { x: 38, y: 57, w: 28, h: 15, r: 7.5 }
const UPPER_BEAM = { x: 72, y: 29, w: 24, h: 8 }
const LOWER_BEAM = { x: 76, y: 62, w: 22, h: 8 }

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
	const uid = useId()
	const maskId = `blync-mark-${uid}`
	const beamId = `blync-beam-${uid}`

	return (
		<svg
			viewBox="0 0 100 100"
			role="img"
			aria-label="BLyNC"
			className={cn('size-5', className)}
			fill="none"
			shapeRendering="geometricPrecision"
			{...props}
		>
			<defs>
				{/*
				  `userSpaceOnUse` keeps the beam fade in the same coordinate space
				  as the geometry; the default objectBoundingBox space is recomputed
				  per shape and would taper each beam against itself.
				*/}
				<linearGradient
					id={beamId}
					x1="72"
					y1="0"
					x2="98"
					y2="0"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0" stopColor={beamColor} stopOpacity="0.72" />
					<stop offset="1" stopColor={beamColor} stopOpacity="0" />
				</linearGradient>
				<mask
					id={maskId}
					maskUnits="userSpaceOnUse"
					x="0"
					y="0"
					width="100"
					height="100"
				>
					<rect {...box(STEM)} fill="#fff" />
					<rect {...box(UPPER_BOWL)} fill="#fff" />
					<rect {...box(LOWER_BOWL)} fill="#fff" />
					<rect {...box(UPPER_COUNTER)} fill="#000" />
					<rect {...box(LOWER_COUNTER)} fill="#000" />
				</mask>
			</defs>
			<rect
				x={UPPER_BEAM.x}
				y={UPPER_BEAM.y}
				width={UPPER_BEAM.w}
				height={UPPER_BEAM.h}
				rx={UPPER_BEAM.h / 2}
				fill={`url(#${beamId})`}
			/>
			<rect
				x={LOWER_BEAM.x}
				y={LOWER_BEAM.y}
				width={LOWER_BEAM.w}
				height={LOWER_BEAM.h}
				rx={LOWER_BEAM.h / 2}
				fill={`url(#${beamId})`}
			/>
			<rect
				x="0"
				y="0"
				width="100"
				height="100"
				fill={color}
				mask={`url(#${maskId})`}
			/>
		</svg>
	)
}

function box(s: { x: number; y: number; w: number; h: number; r: number }) {
	return { x: s.x, y: s.y, width: s.w, height: s.h, rx: s.r }
}
