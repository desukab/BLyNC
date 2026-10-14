import { Square } from 'lucide-react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import type { TransferProgress } from '../../types/transfer'
import { TransferProgressRing } from '../common/TransferProgressRing'
import { StatusIndicator } from '../common/StatusIndicator'
import { Button } from '../ui/button'

interface ReceivingActiveCardProps {
	isReceiving: boolean
	isTransporting: boolean
	isCompleted: boolean
	ticket: string
	transferProgress: TransferProgress | null
	fileNames: string[]
	onReceive: () => Promise<void>
	onStopReceiving: () => Promise<void>
}

export function ReceivingActiveCard({
	isTransporting,
	isCompleted,
	transferProgress,
	fileNames = [],
	onStopReceiving,
}: ReceivingActiveCardProps) {
	const { t } = useTranslation()

	const getStatusText = () => {
		if (isCompleted) return t('common:receiver.downloadCompleted')
		if (isTransporting) return t('common:receiver.downloadingInProgress')
		return t('common:receiver.connectingToSender')
	}

	const statusText = getStatusText()

	return (
		<div className="space-y-4">
			<div className="p-4 rounded-lg absolute top-0 left-0">
				<StatusIndicator
					isCompleted={isCompleted}
					isTransporting={isTransporting}
					statusText={statusText}
				/>
			</div>

			<p className="text-xs text-center my-10 sm:my-0">
				{t('common:receiver.keepAppOpen')}
			</p>

			{/*
			  The same ring the sender uses. `isCompleted` comes from the engine's
			  `receive-completed`, so the finished state appears only once the
			  download really is done.
			*/}
			{(isTransporting || isCompleted) && (
				<TransferProgressRing
					progress={transferProgress}
					isComplete={isCompleted}
					/*
					  Names arrive with `receive-file-names` at the end of the
					  download, so during the transfer there is genuinely nothing
					  to name and the ring shows the counts alone.
					*/
					fileName={isCompleted ? (fileNames[0] ?? '') : ''}
					fileCount={fileNames.length || undefined}
					compact
				/>
			)}

			<Button
				variant={'destructive-outline'}
				size="icon-lg"
				type="button"
				onClick={onStopReceiving}
				className="absolute top-0 right-2 sm:right-6 rounded-full font-medium transition-colors not-disabled:not-active:not-data-pressed:before:shadow-none dark:not-disabled:before:shadow-none dark:not-disabled:not-active:not-data-pressed:before:shadow-none"
				aria-label="Stop receiving"
			>
				<Square className="w-4 h-4" fill="currentColor" />
			</Button>
		</div>
	)
}
