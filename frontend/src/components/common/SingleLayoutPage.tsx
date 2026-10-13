import { cn } from '@/lib/utils'

export function SingleLayoutPage({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				// A fill container, not a scrolling document: the page hands the
				// remaining viewport height to its child and lets that child own
				// its own scroll. This is what stops the transfer card from
				// floating in a fixed slice of the screen on unusual aspect
				// ratios.
				'container mx-auto flex min-h-0 flex-1 flex-col',
				'pt-[calc(1rem+var(--safe-area-top))] pb-[calc(0.5rem+var(--safe-area-bottom))]',
				// Narrow gutter below `sm`, widened only by the safe-area insets.
				'pl-[calc(0.75rem+var(--safe-area-left))] pr-[calc(0.75rem+var(--safe-area-right))]',
				'sm:pl-[calc(2rem+var(--safe-area-left))] sm:pr-[calc(2rem+var(--safe-area-right))]',
				className
			)}
			{...props}
		/>
	)
}
