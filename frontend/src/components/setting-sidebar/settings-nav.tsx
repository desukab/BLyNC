import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { IS_WEB } from '@/lib/platform'
import { cn } from '@/lib/utils'
import { settingSidebarConfig } from './config'

/**
 * Settings sub-navigation. Rendered only by `SettingMobileHeader`, which already
 * gates on the phone breakpoint — a pointer-sized screen keeps the left rail.
 *
 * Settings used to reach its four sections through a drawer that slid up from
 * the left and was force-opened the moment you landed on the settings root —
 * so "Settings" opened onto a menu, and every section was one gesture deeper
 * than every other screen in the app. On a phone a drawer you must summon to
 * navigate is a tax on the most-visited surface.
 *
 * Now the sections are always visible: a scrollable pill row pinned under the
 * screen heading on a phone, and the existing left rail on desktop where there
 * is room for it. Same four destinations, no drawer, no forced gesture.
 */
export function SettingsNav() {
	const { t } = useTranslation()
	const { pathname } = useLocation()

	return (
		<div
			data-slot="settings-nav"
			className={cn(
				'flex gap-1 overflow-x-auto scrollbar-hide',
				'border-b border-border bg-background',
				IS_WEB && 'sticky top-0 z-10'
			)}
			style={{
				paddingLeft: 'calc(1rem + var(--safe-area-left))',
				paddingRight: 'calc(1rem + var(--safe-area-right))',
			}}
		>
			{settingSidebarConfig.core.map((item) => {
				const to = item.to ? `/settings/${item.to}` : '/settings'
				return (
					<NavLink
						key={item.to || 'general'}
						to={to}
						end
						className={({ isActive }) =>
							cn(
								'relative shrink-0 px-3 py-3 text-body font-medium whitespace-nowrap',
								'transition-colors duration-[var(--duration-fast)]',
								isActive || pathname === to
									? 'text-foreground'
									: 'text-muted-foreground'
							)
						}
					>
						{({ isActive }) => (
							<span className="relative inline-block">
								{/* `translationNs` is already fully qualified in the config. */}
								{t(item.translationNs ?? item.label)}
								{/* Underline rather than a filled pill: it reads as a
								    position within a list, not as a button. */}
								<span
									aria-hidden
									className={cn(
										'absolute -bottom-3 left-0 h-0.5 w-full rounded-full bg-primary transition-opacity duration-[var(--duration-fast)]',
										isActive ? 'opacity-100' : 'opacity-0'
									)}
								/>
							</span>
						)}
					</NavLink>
				)
			})}
		</div>
	)
}
