import { buttonVariants } from './ui/button'
import {
	CoffeeIcon,
	GithubIcon,
	GlobeIcon,
	History as HistoryIcon,
	MonitorSmartphone,
	SettingsIcon,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import {
	DONATE_LINK,
	GITHUB_REPO_LINK,
	VERSION_DISPLAY,
	WEBSITE_LINK,
} from '@/lib/version'
import { Separator } from './ui/separator'
import { Link } from 'react-router-dom'
import { handleExternalLinkClick } from '@/lib/openExternalUrl'
import { IS_PAIRING_CAPABLE, IS_TAURI } from '@/lib/platform'
import { cn } from '@/lib/utils'
import { useAppSettingStore } from '@/store/app-setting'
import { useSenderStore } from '@/store/sender-store'
import { RelayStatusButton } from './RelayStatusButton'

const CONTACTS = [
	{
		link: GITHUB_REPO_LINK,
		icon: <GithubIcon />,
		'aria-label': 'Github source code',
	},
	{
		link: DONATE_LINK,
		icon: <CoffeeIcon />,
		'aria-label': 'Buy me a coffee',
	},
	{
		link: WEBSITE_LINK,
		icon: <GlobeIcon />,
		'aria-label': 'DashBeam website',
	},
]

export function AppFooter({
	variant = 'full',
}: {
	variant?: 'full' | 'minimal'
}) {
	const { t } = useTranslation()
	const isSharing = useSenderStore(
		(s) => s.viewState === 'SHARING' || s.viewState === 'TRANSPORTING'
	)
	const showRelayStatus = useAppSettingStore((s) => s.showRelayStatus)

	// On phones the bottom tab bar carries navigation, so the footer drops to
	// the line that has no other home: what this build is, and where to find
	// the project. Every destination it used to link to is still one tap away.
	const minimal = variant === 'minimal'

	return (
		<div
			className={cn(
				'flex w-full items-center border-t border-border bg-background/50 backdrop-blur-md',
				// In minimal mode this collapses to a single hairline-thin line
				// above the tab bar, and does NOT take the bottom safe-area
				// inset — the tab bar directly below already consumes it, and
				// both claiming it wasted ~24px of an 800px screen.
				minimal ? 'min-h-9 justify-center gap-2 py-1' : 'min-h-10'
			)}
			style={{
				paddingTop: minimal ? '0.25rem' : '0.5rem',
				paddingBottom: minimal
					? '0.25rem'
					: 'calc(0.5rem + var(--safe-area-bottom))',
				paddingLeft: 'calc(1rem + var(--safe-area-left))',
				paddingRight: 'calc(1rem + var(--safe-area-right))',
			}}
		>
			<div
				className={cn(
					'space-x-2 flex-1 w-full flex items-center',
					minimal && 'justify-center space-x-1'
				)}
			>
				<span
					className={cn(
						'text-muted-foreground ml-1',
						minimal ? 'text-caption' : 'text-sm'
					)}
				>
					{VERSION_DISPLAY}
				</span>
				<Separator
					className={cn('h-6', minimal ? 'hidden' : 'hidden sm:block')}
					orientation="vertical"
				/>

				{CONTACTS.map((contact) => (
					<a
						key={contact.link}
						href={contact.link}
						onClick={(event) => handleExternalLinkClick(event, contact.link)}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={contact['aria-label']}
						className={cn(
							buttonVariants({
								size: 'icon-sm',
								variant: 'outline',
							}),
							// With the tab bar taking over, these are the only
							// route off-app, so they stay on the phone too — but
							// they shrink visually so the line stays one line
							// tall. `buttonVariants` already expands the hit
							// area to 44px on a coarse pointer, so the smaller
							// box does not cost reachability.
							minimal
								? 'inline-flex size-8 rounded-lg [&_svg]:size-3.5'
								: 'hidden sm:inline-flex'
						)}
					>
						{contact.icon}
					</a>
				))}
			</div>
			<div className="flex flex-1 items-center justify-end gap-2">
				{/* Not gated on IS_PAIRING_CAPABLE: same set today, different meaning. */}
				{IS_TAURI && !minimal ? (
					isSharing ? (
						<span
							aria-disabled
							className={cn(
								buttonVariants({ variant: 'outline', size: 'sm' }),
								'pointer-events-none opacity-64 text-xs sm:text-sm'
							)}
						>
							<HistoryIcon />
							{t('common:history.title')}
						</span>
					) : (
						<Link
							to="/history"
							className={cn(
								buttonVariants({ variant: 'outline', size: 'sm' }),
								'text-xs sm:text-sm'
							)}
						>
							<HistoryIcon />
							{t('common:history.title')}
						</Link>
					)
				) : null}
				{IS_PAIRING_CAPABLE && !minimal ? (
					isSharing ? (
						<span
							aria-disabled
							className={cn(
								buttonVariants({
									variant: 'outline',
									size: 'sm',
								}),
								'pointer-events-none opacity-64 text-xs sm:text-sm'
							)}
						>
							<MonitorSmartphone />
							{t('common:sender.pairDevice')}
						</span>
					) : (
						<Link
							to="/settings/devices"
							className={cn(
								buttonVariants({
									variant: 'outline',
									size: 'sm',
								}),
								'text-xs sm:text-sm'
							)}
						>
							<MonitorSmartphone />
							{t('common:sender.pairDevice')}
						</Link>
					)
				) : null}
				{showRelayStatus && !minimal ? <RelayStatusButton /> : null}
				{!minimal &&
					(isSharing ? (
						<button
							type="button"
							disabled
							aria-label={t('settings.title')}
							className={cn(
								buttonVariants({
									size: 'icon-sm',
									variant: 'outline',
								}),
								'pointer-events-none opacity-64'
							)}
						>
							<SettingsIcon />
						</button>
					) : (
						<Link
							to="/settings"
							className={buttonVariants({
								size: 'icon-sm',
								variant: 'outline',
							})}
							aria-label={t('settings.title')}
						>
							<SettingsIcon />
						</Link>
					))}
			</div>
		</div>
	)
}
