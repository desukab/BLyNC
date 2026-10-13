import { motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { SettingsNav } from '../setting-sidebar/settings-nav'
import { IS_WEB } from '@/lib/platform'
import { cn } from '@/lib/utils'
import { RelayChangeGuard } from '../settings/relay'
import SettingSidebar from '../setting-sidebar'
import { ScrollArea } from '../ui/scroll-area'
import { ScreenTitle } from '../ui/surface'
import { SidebarProvider, SidebarInset, useSidebar } from '../ui/sidebar'
import { useTranslation } from '@/i18n'

/**
 * `useSidebar` has to be read from inside the provider it is provided by, so
 * the mobile header — the only consumer of `isMobile` — lives here rather than
 * in `SettingLayout`, which creates the provider.
 */
function SettingMobileHeader() {
	const { isMobile } = useSidebar()
	const { t } = useTranslation()
	if (!isMobile) return null

	return (
		<div className="pt-[calc(0.75rem+var(--safe-area-top))]">
			<div className="px-[calc(1rem+var(--safe-area-left))] pb-1 pr-[calc(1rem+var(--safe-area-right))]">
				<ScreenTitle size="inline">{t('settings.title')}</ScreenTitle>
			</div>
			<SettingsNav />
		</div>
	)
}

export function SettingLayout() {
	const location = useLocation()

	return (
		<SidebarProvider className={IS_WEB ? 'h-full min-h-0' : undefined}>
			<SettingSidebar />
			<SidebarInset className="min-h-0">
				<SettingMobileHeader />
				{/* Pin the scrollbar visible (opacity-0 until hover by default) so the
				    overflow is always obvious. */}
				<ScrollArea className="[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:opacity-100">
					<motion.div
						key={location.pathname}
						// The settings pane fills the viewport on native, so its edges are
						// the screen edges: pad the content past the system bars.
						className={cn(
							'flex flex-col gap-6 outline-none',
							'pl-[calc(1rem+var(--safe-area-left))]',
							'pr-[calc(1rem+var(--safe-area-right))]',
							'pb-[calc(3rem+var(--safe-area-bottom))]'
						)}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.25, ease: 'easeOut' }}
					>
						<Outlet />
					</motion.div>
				</ScrollArea>
			</SidebarInset>
			<RelayChangeGuard />
		</SidebarProvider>
	)
}
