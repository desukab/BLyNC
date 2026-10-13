import { Share2 } from 'lucide-react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import type { ShareActionProps } from '../../types/sender'
import { Button } from '../ui/button'

/**
 * The commit action for Send.
 *
 * It was a bare full-width default button under the picker. On a phone that
 * put the single most consequential control in the app at the end of a scrolling
 * column, where it drifted out of reach as soon as a file name wrapped. It now
 * carries the accent, sits at a consistent height, and stays last in the
 * column so the eye lands on it after the selection.
 */
export function ShareActionCard({
	selectedPaths,
	selectedPath,
	isLoading,
	onStartSharing,
}: ShareActionProps & { onStartSharing: () => Promise<void> }) {
	const { t } = useTranslation()
	if (!selectedPaths.length && !selectedPath) return null

	return (
		<div className="flex flex-col gap-2">
			<Button
				type="button"
				size="lg"
				onClick={onStartSharing}
				disabled={isLoading}
				className="w-full"
			>
				<Share2 className="size-4.5" />
				{isLoading
					? t('common:sender.startingShare')
					: t('common:sender.startSharing')}
			</Button>
		</div>
	)
}
