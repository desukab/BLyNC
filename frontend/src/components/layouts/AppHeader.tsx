import { useLocation } from 'react-router-dom'
import { BlyncWordmark } from '../brand/BlyncWordmark'
import { IS_ANDROID } from '@/lib/platform'
import { cn } from '@/lib/utils'

/**
 * The one piece of chrome Android needs and the desktop does not.
 *
 * Native Android has no OS-drawn title bar, so before this the Send screen
 * opened with nothing at all naming the product and nothing reserving the
 * status-bar strip — on an edge-to-edge build the top of the card sat under the
 * clock. This bar does both jobs and stops there: no tabs, no actions, nothing
 * that competes with the transfer UI underneath it.
 *
 * History and Settings already draw their own headers (a title plus a back
 * target), so the bar yields to them rather than stacking a second one.
 */
export function AppHeader() {
	const { pathname } = useLocation()

	if (!IS_ANDROID) return null

	// Anything that is not the transfer screen brings its own header.
	if (pathname !== '/' && pathname !== '/receive') return null

	return (
		<header
			data-slot="app-header"
			className={cn(
				'flex shrink-0 items-center border-b border-border/70 bg-background/80 backdrop-blur-xl'
			)}
			style={{
				// The strip itself is the status bar; the bar sits below it.
				paddingTop: 'var(--safe-area-top)',
			}}
		>
			<div
				className="flex w-full items-center px-[calc(1rem+var(--safe-area-left))] pb-0 pr-[calc(1rem+var(--safe-area-right))]"
				style={{
					height: 'calc(2.5rem + var(--safe-area-top))',
					paddingTop: 'var(--safe-area-top)',
				}}
			>
				<BlyncWordmark size="sm" className="text-[15px]" />
			</div>
		</header>
	)
}
