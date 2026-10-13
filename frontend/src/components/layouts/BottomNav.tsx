import { NavLink, useLocation } from 'react-router-dom'
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	Clock,
	Settings2,
} from 'lucide-react'
import { useReceiverContext } from '@/components/receiver/ReceiverProvider'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { useSenderStore } from '@/store/sender-store'

/**
 * Primary navigation.
 *
 * Before this, the app had no navigation model: Send and Receive were a
 * segmented control inside a card header, while History and Settings were
 * outline buttons in the footer. That put the app's four destinations at two
 * different depths, and made History — a separate place, not a mode — look like
 * part of a control.
 *
 * BLyNC treats all four as equal top-level destinations in a bottom bar, the
 * arrangement Android already has a mental model for. Desktop keeps the footer
 * rail, where a bottom bar would be an odd shape against a resizable window.
 */

export function BottomNav() {
	const { t } = useTranslation()
	const { pathname } = useLocation()
	const senderViewState = useSenderStore((s) => s.viewState)
	// The provider wraps the whole shell, so the receiver's live state is
	// reachable from here.
	const isReceiving = useReceiverContext().isReceiving

	const isSending =
		senderViewState === 'SHARING' || senderViewState === 'TRANSPORTING'
	// Matches the old tabs: you cannot walk away from a live transfer, because
	// the other screen is the one that ends it.
	const transferLocked = isSending || isReceiving

	const DESTINATIONS = [
		{
			to: '/',
			label: t('common:send'),
			Icon: ArrowUpFromLine,
			matches: (p: string) => p === '/',
			locked: isReceiving,
		},
		{
			to: '/receive',
			label: t('common:receive'),
			Icon: ArrowDownToLine,
			matches: (p: string) => p === '/receive',
			locked: isSending,
		},
		{
			to: '/history',
			label: t('common:history.title'),
			Icon: Clock,
			matches: (p: string) => p.startsWith('/history'),
			locked: transferLocked,
		},
		{
			to: '/settings',
			label: t('settings.title'),
			Icon: Settings2,
			matches: (p: string) => p.startsWith('/settings'),
			locked: transferLocked,
		},
	] as const

	return (
		<nav
			data-slot="bottom-nav"
			aria-label={t('appTitle')}
			className="flex shrink-0 items-stretch border-t border-border bg-background/95 backdrop-blur-xl"
			style={{ paddingBottom: 'var(--safe-area-bottom)' }}
		>
			{DESTINATIONS.map(({ to, label, Icon, matches, locked }) => {
				const active = matches(pathname)
				return (
					<NavLink
						key={to}
						to={to}
						aria-current={active ? 'page' : undefined}
						aria-disabled={locked || undefined}
						onClick={(event) => {
							if (locked) event.preventDefault()
						}}
						className={cn(
							'flex min-h-14 flex-1 flex-col items-center justify-center gap-1',
							'px-1 py-1.5 text-[11px] font-medium tracking-[0.01em]',
							'transition-colors duration-[var(--duration-fast)]',
							'text-muted-foreground active:bg-accent',
							locked && 'pointer-events-none opacity-40',
							active && 'text-foreground'
						)}
					>
						<span
							data-slot="bottom-nav-icon"
							className={cn(
								'flex size-7 items-center justify-center rounded-full',
								'transition-colors duration-[var(--duration-fast)]',
								active && 'bg-primary/14 text-primary'
							)}
						>
							<Icon
								className="size-[18px]"
								strokeWidth={active ? 2.25 : 1.75}
							/>
						</span>
						<span className="max-w-full truncate">{label}</span>
					</NavLink>
				)
			})}
		</nav>
	)
}
