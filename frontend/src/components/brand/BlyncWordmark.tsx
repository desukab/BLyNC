import { cn } from '@/lib/utils'
import { BlyncMark } from './BlyncMark'

export type BlyncWordmarkProps = {
	className?: string
	/**
	 * Hides the lettering and leaves the mark on its own. Used where the
	 * product is already named in the surrounding chrome.
	 */
	markOnly?: boolean
	/** Renders the mark at a size matched to the wordmark's cap height. */
	size?: 'sm' | 'md' | 'lg'
}

const MARK_SIZE = {
	sm: 'size-4',
	md: 'size-[1.15em]',
	lg: 'size-[1.05em]',
} as const

/**
 * Wordmark lockup. The display half is the dot matrix, the reading half is
 * plain UI type — the dot grid is a brand moment, and keeping it out of
 * headings, buttons and settings is what stops it competing with the content.
 */
export function BlyncWordmark({
	className,
	markOnly = false,
	size = 'md',
}: BlyncWordmarkProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-[0.34em] select-none',
				'font-heading font-semibold tracking-[-0.02em]',
				className
			)}
		>
			<BlyncMark
				className={cn('shrink-0', MARK_SIZE[size])}
				aria-hidden="true"
			/>
			{!markOnly && <span className="text-foreground">BLyNC</span>}
		</span>
	)
}
