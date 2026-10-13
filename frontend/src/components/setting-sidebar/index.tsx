import {
	SettingSidebarContent,
	SettingSidebarCore,
	SettingSidebarFooter,
	SettingSidebarHeader,
	SettingSidebarRoot,
	SettingSidebarTitle,
} from './setting-sidebar'
import { SettingSidebarUpdateAlert } from './setting-sidebar-update-alert'
import { IS_WEB } from '@/lib/platform'
import { cn } from '@/lib/utils'

/**
 * Desktop only. On a phone the same destinations are rendered inline by
 * `SettingsNav`, so this rail is not mounted at all — which also means nothing
 * has to open a drawer on arrival.
 */
export default function SettingSidebar() {
	return (
		<SettingSidebarRoot
			className={cn(IS_WEB ? 'h-full' : 'h-[calc(100svh)]')}
			variant="floating"
		>
			<SettingSidebarHeader className="border-b">
				<SettingSidebarTitle prev="/" />
			</SettingSidebarHeader>
			<SettingSidebarContent>
				<SettingSidebarCore />
			</SettingSidebarContent>
			<SettingSidebarUpdateAlert />
			<SettingSidebarFooter />
		</SettingSidebarRoot>
	)
}
