import type * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * `Frame` is retained as the name every screen already imports, but its
 * composition has changed.
 *
 * It used to render a tinted rounded container *around* a bordered panel, so
 * each unit was two nested boxes separated by a 4px moat, with its title
 * floating on the outer surface and its body on the inner one. Now `Frame` is
 * a plain vertical group: the header is a caption above the content, and the
 * panel is a single raised surface. Existing call sites keep working and pick
 * up the new model at once.
 *
 * New code should prefer `Section` + `Card`/`ListGroup` from ./surface, which
 * make the grouping explicit.
 */

function Frame({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="frame"
			className={cn('flex flex-col gap-2', className)}
			{...props}
		/>
	)
}

function FramePanel({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="frame-panel"
			className={cn(
				'relative flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-surface-raised p-4 sm:p-5',
				className
			)}
			{...props}
		/>
	)
}

function FrameHeader({ className, ...props }: React.ComponentProps<'header'>) {
	return (
		<header
			data-slot="frame-panel-header"
			className={cn('flex flex-col gap-0.5 px-1 pt-1', className)}
			{...props}
		/>
	)
}

function FrameTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="frame-panel-title"
			className={cn(
				'text-caption font-semibold uppercase tracking-[0.07em] text-muted-foreground',
				className
			)}
			{...props}
		/>
	)
}

function FrameDescription({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="frame-panel-description"
			className={cn(
				'text-callout text-muted-foreground text-pretty',
				className
			)}
			{...props}
		/>
	)
}

function FrameFooter({ className, ...props }: React.ComponentProps<'footer'>) {
	return (
		<footer
			data-slot="frame-panel-footer"
			className={cn('flex flex-col gap-2 px-1 pb-1', className)}
			{...props}
		/>
	)
}

export {
	Frame,
	FramePanel,
	FrameHeader,
	FrameTitle,
	FrameDescription,
	FrameFooter,
}
