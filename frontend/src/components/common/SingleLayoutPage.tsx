import { cn } from '@/lib/utils'

export function SingleLayoutPage({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'container mx-auto flex flex-1 flex-col overflow-auto',
				// Android is edge-to-edge and the transfer card is the first thing
				// in this container, so the top inset has to be spent here or the
				// status bar draws over it.
				'pt-[calc(2rem+var(--safe-area-top))] pb-8',
				// Narrow gutter below `sm`, widened only by the safe-area insets.
				'pl-[calc(0.75rem+var(--safe-area-left))] pr-[calc(0.75rem+var(--safe-area-right))]',
				'sm:pl-[calc(2rem+var(--safe-area-left))] sm:pr-[calc(2rem+var(--safe-area-right))]',
				className
			)}
			{...props}
		/>
	)
}
