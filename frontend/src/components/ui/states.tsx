import type * as React from 'react'
import { AlertCircle, Loader2, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * The four states every data-bearing surface in BLyNC has to render.
 *
 * They were previously improvised per screen — a bare spinner, an icon plus two
 * differently-sized sentences, a red inline paragraph for an unexpected view
 * state. Consolidating them here means an empty History and an empty Paired
 * Devices read as the same designed thing, and a failure always offers the
 * same way out.
 */

function StateShell({
	className,
	children,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="state"
			className={cn(
				'flex flex-col items-center justify-center gap-3 px-6 py-10 text-center',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

function StateIcon({
	className,
	children,
	tone = 'muted',
	...props
}: React.ComponentProps<'div'> & { tone?: 'muted' | 'destructive' }) {
	return (
		<div
			data-slot="state-icon"
			className={cn(
				'flex size-12 items-center justify-center rounded-2xl [&_svg]:size-6',
				tone === 'destructive'
					? 'bg-destructive/12 text-destructive'
					: 'bg-muted text-muted-foreground',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export function LoadingState({
	label,
	className,
	compact,
}: {
	label?: React.ReactNode
	className?: string
	compact?: boolean
}) {
	return (
		<StateShell
			className={cn(compact && 'py-6', className)}
			role="status"
			aria-busy="true"
			aria-live="polite"
		>
			<StateIcon>
				<Loader2 className="animate-spin" />
			</StateIcon>
			{label && (
				<span className="text-callout text-muted-foreground">{label}</span>
			)}
		</StateShell>
	)
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: {
	icon?: React.ReactNode
	title: React.ReactNode
	description?: React.ReactNode
	action?: React.ReactNode
	className?: string
}) {
	return (
		<StateShell className={className}>
			{icon && <StateIcon>{icon}</StateIcon>}
			<div className="flex flex-col gap-1">
				<p className="text-heading font-medium">{title}</p>
				{description && (
					<p className="text-callout text-muted-foreground text-pretty">
						{description}
					</p>
				)}
			</div>
			{action}
		</StateShell>
	)
}

export function ErrorState({
	title,
	description,
	onRetry,
	retryLabel,
	className,
}: {
	title: React.ReactNode
	description?: React.ReactNode
	onRetry?: () => void
	retryLabel?: React.ReactNode
	className?: string
}) {
	return (
		<StateShell className={cn('text-left items-start', className)} role="alert">
			<StateIcon tone="destructive">
				<AlertCircle />
			</StateIcon>
			<div className="flex flex-col gap-1">
				<p className="text-heading font-medium text-destructive">{title}</p>
				{description && (
					<p className="text-callout text-muted-foreground text-pretty">
						{description}
					</p>
				)}
			</div>
			{onRetry && (
				<Button variant="outline" size="sm" onClick={onRetry}>
					<RotateCw />
					{retryLabel ?? 'Retry'}
				</Button>
			)}
		</StateShell>
	)
}
