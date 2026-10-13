import { Link, matchPath, NavLink, useLocation } from 'react-router-dom'
import {
	Highlight,
	HighlightItem,
} from '@/components/animate-ui/primitives/effects/highlight'
import { handleExternalLinkClick } from '@/lib/openExternalUrl'
import { useTranslation } from '../../i18n'
import { cn } from '../../lib/utils'
import {
	GITHUB_REPO_LINK,
	LICENSE_LINK,
	PRIVACY_LINK,
	VERSION_DISPLAY,
} from '../../lib/version'
import { BackArrowIcon } from '../back-arrow-icon'
import { LazyIcon } from '../icons'
import { Badge } from '../ui/badge'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '../ui/sidebar'
import { settingSidebarConfig } from './config'

const SETTINGS_NAV_TRANSITION = {
	type: 'spring' as const,
	stiffness: 500,
	damping: 35,
}

function settingsNavValue(to: string) {
	return to || 'general'
}

function useActiveSettingsNavValue() {
	const { pathname } = useLocation()
	const items = settingSidebarConfig.core

	const active = items.find((item) => {
		const path = item.to ? `/settings/${item.to}` : '/settings'
		return matchPath({ path, end: true }, pathname) != null
	})

	return settingsNavValue(active?.to ?? '')
}

function SettingSidebarRoot(props: React.ComponentProps<typeof Sidebar>) {
	return <Sidebar {...props} />
}

function SettingSidebarHeader(
	props: React.ComponentProps<typeof SidebarHeader>
) {
	return <SidebarHeader {...props} />
}

function SettingSidebarTitle({
	className,
	prev,
	...props
}: React.ComponentProps<'div'> & { prev: string }) {
	const { t } = useTranslation()

	return (
		<Link to={prev}>
			<div
				{...props}
				className={cn(
					'group/sheader flex items-center gap-2 px-1.5',
					className
				)}
			>
				<BackArrowIcon size={18} className="text-muted-foreground" />
				<h3 className="text-lg font-medium">{t('settings.title')}</h3>
			</div>
		</Link>
	)
}

function SettingSidebarContent(
	props: React.ComponentProps<typeof SidebarContent>
) {
	return <SidebarContent {...props} />
}

function SettingSidebarCore() {
	const items = settingSidebarConfig.core
	const { t } = useTranslation()
	const { isMobile, setOpenMobile } = useSidebar()
	const activeValue = useActiveSettingsNavValue()

	return (
		<SidebarGroup>
			<Highlight
				controlledItems
				value={activeValue}
				click={false}
				transition={SETTINGS_NAV_TRANSITION}
				className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-sidebar-accent"
			>
				{/* Mobile taps need roomier rows than the dense desktop list. */}
				<SidebarMenu className={cn(isMobile && 'gap-2')}>
					{items.map((item) => (
						<SidebarMenuItem key={item.label}>
							<HighlightItem
								value={settingsNavValue(item.to)}
								disabled={item.disable}
								className="w-full"
							>
								<NavLink
									className="flex items-center gap-2 data-[disabled=true]:pointer-events-none"
									to={item.to}
									data-disabled={item.disable === true}
									onClick={(e) => {
										if (item.disable) {
											e.preventDefault()
											e.stopPropagation()
											return
										}
										if (isMobile) {
											setOpenMobile(false)
										}
									}}
									end
								>
									{({ isActive }) => (
										<SidebarMenuButton
											isActive={isActive}
											disabled={item.disable}
											className={cn(
												'data-[active=true]:bg-transparent',
												isMobile && 'h-11 gap-3 px-3'
											)}
										>
											{item.icon && (
												<LazyIcon
													weight={isActive ? 'duotone' : 'regular'}
													name={item.icon}
												/>
											)}
											<span>
												{item.translationNs
													? t(item.translationNs)
													: item.label}
											</span>
											{item.comingSoon && (
												<Badge size="sm" variant="info">
													{t('comingSoon')}
												</Badge>
											)}
										</SidebarMenuButton>
									)}
								</NavLink>
							</HighlightItem>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</Highlight>
		</SidebarGroup>
	)
}

function SettingSidebarFooter({
	className,
	children,
	...props
}: React.ComponentProps<typeof SidebarFooter>) {
	const { t } = useTranslation()
	return (
		<SidebarFooter
			className={cn(
				'flex-col items-center gap-1 text-center text-xs text-muted-foreground',
				className
			)}
			{...props}
		>
			{/*
			  Attribution lives here rather than in the app footer: AGPL-3.0
			  requires the work it is derived from to stay credited, and the
			  About corner of Settings is where someone looks for it. The old
			  TODO asking for exactly this link is now answered.
			*/}
			<div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
				<span>{VERSION_DISPLAY}</span>
				<span aria-hidden className="text-muted-foreground/50">
					·
				</span>
				<a
					className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
					href={GITHUB_REPO_LINK}
					onClick={(event) => handleExternalLinkClick(event, GITHUB_REPO_LINK)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{t('brand.poweredBy')}
				</a>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
				<a
					className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
					href={PRIVACY_LINK}
					onClick={(event) => handleExternalLinkClick(event, PRIVACY_LINK)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{t('privacyPolicy')}
				</a>
				<span aria-hidden className="text-muted-foreground/50">
					·
				</span>
				<a
					className="rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
					href={LICENSE_LINK}
					onClick={(event) => handleExternalLinkClick(event, LICENSE_LINK)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{t('license')}
				</a>
			</div>
		</SidebarFooter>
	)
}

export {
	SettingSidebarContent,
	SettingSidebarHeader,
	SettingSidebarRoot,
	SettingSidebarTitle,
	SettingSidebarCore,
	SettingSidebarFooter,
}
