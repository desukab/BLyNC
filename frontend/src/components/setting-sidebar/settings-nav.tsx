import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from '@/i18n'
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
 * The four sections are now always visible under the screen heading. The row
 * has to survive a 360px viewport, where the full labels need ~440px: every
 * item therefore carries a short form, switched on with a container query so
 * the decision is made from the width actually available rather than from a
 * device guess, and the row still scrolls if a translation is longer than
 * either form.
 */
export function SettingsNav() {
	const { t } = useTranslation()
	const { pathname } = useLocation()

	return (
		<div
			data-slot="settings-nav"
			className={cn(
				// A container query on the row itself: the short-label switch keys
				// off the space this component really has.
				'@container',
				'flex gap-1 overflow-x-auto overscroll-x-contain scrollbar-hide',
				'border-b border-border bg-background'
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
								{/* This row is phone-only (`SettingMobileHeader` gates it),
								    and the four full labels need ~440px, which a 360px
								    phone does not have. So the short form is the
								    default here and the full label is the fallback for
								    sections without one. Nothing is clipped and no
								    section is unreachable at any supported width. */}
								{item.shortTranslationNs ? (
									<span>{t(item.shortTranslationNs)}</span>
								) : (
									<span>{t(item.translationNs ?? item.label)}</span>
								)}
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
