import type * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * BLyNC's layout primitives.
 *
 * The app this replaced drew every unit as a tinted container wrapped around a
 * bordered panel, so a settings page rendered as a stack of paired rounded
 * rectangles with no hierarchy. These primitives instead put content straight
 * onto the page and spend a border or a fill only where it means something:
 * a group is separated by a hairline, a genuinely interactive surface gets a
 * card, and anything that floats gets real elevation.
 *
 * Everything here is layout only. Behaviour stays with the screens.
 */

function Screen({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="screen"
			className={cn(
				'flex min-h-0 w-full flex-1 flex-col',
				// The page owns its insets: no descendant has to know about them.
				'px-[calc(1rem+var(--safe-area-left))]',
				'pr-[calc(1rem+var(--safe-area-right))]',
				className
			)}
			{...props}
		/>
	)
}

/**
 * Scroll body for a screen. `min-h-0` + `overflow-y-auto` is what lets the
 * content shrink instead of pushing a bottom bar off-screen.
 */
function ScreenBody({
	className,
	children,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="screen-body"
			className={cn(
				'flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto',
				'pt-4 pb-[calc(1rem+var(--safe-area-bottom))]',
				'overscroll-contain',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

/**
 * Screen title. Large by default because it is the one element that tells you
 * where you are; pass `size="inline"` where a screen already has an app bar
 * carrying that same title.
 */
function ScreenTitle({
	className,
	size = 'display',
	...props
}: React.ComponentProps<'h1'> & { size?: 'display' | 'inline' }) {
	const Tag = 'h1' as const
	return (
		<Tag
			data-slot="screen-title"
			className={cn(
				'font-heading font-semibold tracking-[-0.02em] text-balance',
				size === 'display'
					? 'text-display leading-[1.15]'
					: 'text-title leading-tight',
				className
			)}
			{...props}
		/>
	)
}

function ScreenSubtitle({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot="screen-subtitle"
			className={cn(
				'text-callout text-muted-foreground text-pretty',
				className
			)}
			{...props}
		/>
	)
}

/**
 * A titled group. The label is a small, tracked caption rather than another
 * box, which is what lets a page with seven groups still read as one page.
 */
function Section({
	className,
	label,
	description,
	children,
	...props
}: React.ComponentProps<'section'> & {
	label?: React.ReactNode
	description?: React.ReactNode
}) {
	return (
		<section
			data-slot="section"
			className={cn('flex flex-col gap-2', className)}
			{...props}
		>
			{(label || description) && (
				<header className="flex flex-col gap-0.5 px-1">
					{label && (
						<h2
							data-slot="section-label"
							className="text-caption font-semibold uppercase tracking-[0.07em] text-muted-foreground"
						>
							{label}
						</h2>
					)}
					{description && (
						<ScreenSubtitle className="text-caption leading-relaxed">
							{description}
						</ScreenSubtitle>
					)}
				</header>
			)}
			{children}
		</section>
	)
}

/**
 * A contained surface, used where the user is meant to act *on* something
 * (drop a payload, read a code). One level, one border — never nested in
 * another Card.
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card"
			className={cn(
				'relative flex flex-col rounded-2xl border border-border bg-surface-raised',
				className
			)}
			{...props}
		/>
	)
}

/** Grouped rows. The separator is a hairline between items, not boxes. */
function ListGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="list-group"
			className={cn(
				'flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised',
				className
			)}
			{...props}
		/>
	)
}

/**
 * One row in a `ListGroup`.
 *
 * The row renders as a real `button` when it acts and a real `anchor` when it
 * navigates, so assistive tech announces it correctly and keyboard focus works
 * without extra wiring. A row that only displays information stays a `div` —
 * announcing a control that does nothing is its own kind of wrong.
 */
function ListRowBase({
	label,
	description,
	value,
	trailing,
	icon,
	children,
}: {
	label: React.ReactNode
	description?: React.ReactNode
	value?: React.ReactNode
	trailing?: React.ReactNode
	icon?: React.ReactNode
	children?: React.ReactNode
}) {
	return (
		<>
			{icon && (
				<span
					data-slot="list-row-icon"
					className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4.5"
				>
					{icon}
				</span>
			)}
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span
					data-slot="list-row-label"
					className="text-body leading-snug font-medium text-pretty"
				>
					{label}
				</span>
				{description && (
					<span
						data-slot="list-row-description"
						className="text-callout leading-snug text-muted-foreground text-pretty"
					>
						{description}
					</span>
				)}
			</span>
			{value && (
				<span
					data-slot="list-row-value"
					className="shrink-0 text-callout tabular-nums text-muted-foreground"
				>
					{value}
				</span>
			)}
			{trailing && (
				<span
					data-slot="list-row-trailing"
					className="flex shrink-0 items-center"
				>
					{trailing}
				</span>
			)}
			{children}
		</>
	)
}

type ListRowProps = {
	label: React.ReactNode
	description?: React.ReactNode
	value?: React.ReactNode
	trailing?: React.ReactNode
	icon?: React.ReactNode
	destructive?: boolean
	onClick?: () => void
	href?: string
	className?: string
	id?: string
	'aria-label'?: string
	'aria-current'?: boolean | 'page' | 'step'
	disabled?: boolean
}

function ListRow(props: ListRowProps) {
	const { onClick, href, className } = props

	if (href) {
		return (
			<a
				data-slot="list-row"
				href={href}
				onClick={onClick}
				id={props.id}
				aria-label={props['aria-label']}
				aria-current={props['aria-current']}
				className={cn('cursor-pointer active:bg-accent', className)}
			>
				<ListRowBase {...props} />
			</a>
		)
	}

	if (onClick) {
		return (
			<button
				data-slot="list-row"
				type="button"
				onClick={onClick}
				disabled={props.disabled}
				id={props.id}
				aria-label={props['aria-label']}
				aria-current={props['aria-current']}
				className={cn('cursor-pointer active:bg-accent', className)}
			>
				<ListRowBase {...props} />
			</button>
		)
	}

	return (
		<div data-slot="list-row" id={props.id} className={className}>
			<ListRowBase {...props} />
		</div>
	)
}

export {
	Screen,
	ScreenBody,
	ScreenTitle,
	ScreenSubtitle,
	Section,
	Card,
	ListGroup,
	ListRow,
}
