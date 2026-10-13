import { FolderOpenIcon } from 'lucide-react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import type { BrowseButtonsProps } from '../../types/sender'
import { Button } from '../ui/button'

/**
 * The alternative selection path on Send.
 *
 * The selection card is itself the picker — tapping anywhere on it opens the
 * file browser. That left this component adding two more buttons restating the
 * same action directly beneath it, so an empty Send screen spent ~330px of a
 * 800px viewport on three ways to do one thing, and the real choice (file vs
 * folder) had no emphasis.
 *
 * Now the card carries the primary action and this is the one secondary path
 * that is genuinely different from it: sending a whole folder. It is a text
 * button rather than a filled one, so it reads as a fallback and not as a
 * competing primary. Both paths stay available.
 */
export function BrowseButtons({
	isLoading,
	onBrowseFolder,
}: Omit<BrowseButtonsProps, 'onBrowseFile'>) {
	const { t } = useTranslation()

	return (
		<div className="flex justify-center">
			<Button
				type="button"
				variant="link"
				size="sm"
				onClick={(e) => {
					e.stopPropagation()
					onBrowseFolder()
				}}
				disabled={isLoading}
				className="text-muted-foreground px-2"
			>
				<FolderOpenIcon className="size-4" />
				{t('common:sender.browseFolder')}
			</Button>
		</div>
	)
}
