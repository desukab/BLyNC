import { FileTextIcon, FolderOpenIcon } from 'lucide-react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import type { BrowseButtonsProps } from '../../types/sender'
import { Button } from '../ui/button'

/**
 * The two ways to pick something on Send.
 *
 * Files is the action almost everyone wants, so it is the filled primary and
 * Folders is its outlined peer. They used to be two identical buttons in a
 * hairline-joined group, which gave no hint that one was the common path —
 * and on a phone they stacked, so the order they read in changed by device.
 */
export function BrowseButtons({
	isLoading,
	onBrowseFile,
	onBrowseFolder,
}: BrowseButtonsProps) {
	const { t } = useTranslation()

	return (
		<div className="flex flex-col gap-2 sm:flex-row">
			<Button
				type="button"
				variant="outline"
				size="lg"
				onClick={(e) => {
					e.stopPropagation()
					onBrowseFolder()
				}}
				disabled={isLoading}
				className="w-full sm:w-auto"
			>
				<FolderOpenIcon className="size-4.5" />
				{t('common:sender.browseFolder')}
			</Button>
			<Button
				type="button"
				size="lg"
				onClick={(e) => {
					e.stopPropagation()
					onBrowseFile()
				}}
				disabled={isLoading}
				className="w-full sm:w-auto"
			>
				{isLoading ? (
					t('common:loading')
				) : (
					<>
						<FileTextIcon className="size-4.5" />
						{t('common:sender.browseFile')}
					</>
				)}
			</Button>
		</div>
	)
}
