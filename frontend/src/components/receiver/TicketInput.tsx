import { ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import { getPreviewFileIcon } from '../../lib/fileIcons'
import { formatFileSize } from '../../lib/utils'
import type { TicketInputProps } from '../../types/receiver'
import type { TicketPreviewMetadata } from '../../types/transfer'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

const getThumbnailSrc = (thumbnail?: string) => {
	if (!thumbnail) return null
	return thumbnail.startsWith('data:')
		? thumbnail
		: `data:image/jpeg;base64,${thumbnail}`
}

function TicketPreviewCard({
	previewMetadata,
}: {
	previewMetadata: TicketPreviewMetadata
}) {
	const { t } = useTranslation()
	const [failedThumbnailKeys, setFailedThumbnailKeys] = useState<
		Record<string, true>
	>({})
	const [isPreviewListExpanded, setIsPreviewListExpanded] = useState(false)

	const previewThumbnailKey =
		previewMetadata.thumbnail && previewMetadata.fileName
			? `${previewMetadata.fileName}:${previewMetadata.thumbnail}`
			: null
	const isCollectionPreview =
		previewMetadata.itemCount > 1 ||
		previewMetadata.mimeType === 'application/x-iroh-collection'
	const previewThumbnailSrc = isCollectionPreview
		? null
		: getThumbnailSrc(previewMetadata.thumbnail)
	const previewItems = previewMetadata.items ?? []
	const canExpandPreviewList = previewItems.length > 1
	const previewDisplayName =
		canExpandPreviewList && isPreviewListExpanded
			? t('common:receiver.multipleFilesFound')
			: previewMetadata.itemCount > 1
				? t('common:receiver.previewMultipleItems', {
						name: previewMetadata.fileName,
						count: previewMetadata.itemCount - 1,
					})
				: previewMetadata.fileName

	const hasFailedThumbnail = (key: string | null) =>
		Boolean(key && failedThumbnailKeys[key])

	const markThumbnailFailed = (key: string | null) => {
		if (!key) return
		setFailedThumbnailKeys((prev) => ({ ...prev, [key]: true }))
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
			<div className="p-3 flex gap-3 items-center">
				<div className="w-14 h-14 rounded-md border bg-muted shrink-0 flex items-center justify-center relative overflow-hidden">
					{previewThumbnailSrc && !hasFailedThumbnail(previewThumbnailKey) ? (
						<img
							src={previewThumbnailSrc}
							alt={previewMetadata.fileName}
							className="w-full h-full object-cover"
							onError={() => markThumbnailFailed(previewThumbnailKey)}
						/>
					) : (
						getPreviewFileIcon(
							isCollectionPreview
								? 'application/x-iroh-collection'
								: previewMetadata.mimeType,
							previewMetadata.fileName
						)
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium truncate">{previewDisplayName}</p>
					<p className="text-xs text-muted-foreground">
						{formatFileSize(previewMetadata.size)}
					</p>
				</div>
				{canExpandPreviewList ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0 h-8 w-8"
						aria-label={
							isPreviewListExpanded
								? t('common:receiver.collapsePreviewList')
								: t('common:receiver.expandPreviewList')
						}
						onClick={() => setIsPreviewListExpanded((expanded) => !expanded)}
					>
						{isPreviewListExpanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>
				) : null}
			</div>
			{canExpandPreviewList && isPreviewListExpanded ? (
				<div className="border-t border-border">
					<div className="max-h-64 overflow-y-auto p-2 space-y-2">
						{previewItems.map((item) => {
							const itemThumbnailKey =
								item.thumbnail && item.fileName
									? `${item.fileName}:${item.thumbnail}`
									: null
							const itemThumbnailSrc = getThumbnailSrc(item.thumbnail)

							return (
								<div
									key={item.fileName}
									className="flex items-center gap-3 px-2 py-2"
								>
									<div className="w-12 h-12 rounded-md border bg-muted shrink-0 flex items-center justify-center overflow-hidden">
										{itemThumbnailSrc &&
										!hasFailedThumbnail(itemThumbnailKey) ? (
											<img
												src={itemThumbnailSrc}
												alt={item.fileName}
												className="w-full h-full object-cover"
												onError={() => markThumbnailFailed(itemThumbnailKey)}
											/>
										) : (
											getPreviewFileIcon(item.mimeType, item.fileName)
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium break-all line-clamp-2">
											{item.fileName}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatFileSize(item.size)}
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			) : null}
		</div>
	)
}

export function TicketInput({
	ticket,
	isReceiving,
	previewMetadata,
	isPreviewLoading,
	onTicketChange,
	onReceive,
}: TicketInputProps) {
	const { t } = useTranslation()
	const previewMetadataKey = previewMetadata
		? JSON.stringify(previewMetadata)
		: 'no-preview'

	return (
		<div className="flex flex-col gap-4">
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<p className="text-caption font-semibold uppercase tracking-[0.07em] text-muted-foreground">
					{t('common:receiver.stepCode')}
				</p>
				<p id="ticket-input-label" className="text-body font-medium">
					{t('common:receiver.pasteTicket')}
				</p>
				<div className="flex gap-2">
					<Textarea
						aria-labelledby="ticket-input-label"
						value={ticket}
						onChange={(e) => onTicketChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault()
								if (ticket.trim() && !isReceiving) {
									onReceive()
								}
							}
						}}
						placeholder={t('common:receiver.ticketPlaceholder')}
						className="min-h-28 font-mono text-body"
						rows={5}
					/>
				</div>
			</div>

			{isPreviewLoading && ticket.trim() && !previewMetadata ? (
				<div
					role="status"
					aria-live="polite"
					className="flex items-center gap-2 rounded-2xl border border-border bg-surface-raised px-4 py-3 text-callout text-muted-foreground"
				>
					<Loader2 className="size-4 shrink-0 animate-spin" />
					{t('common:receiver.connectingToSender')}
				</div>
			) : null}

			{previewMetadata ? (
				<TicketPreviewCard
					key={previewMetadataKey}
					previewMetadata={previewMetadata}
				/>
			) : null}

			<Button
				type="button"
				size="lg"
				onClick={onReceive}
				disabled={!ticket.trim() || isReceiving}
				className="w-full"
			>
				<Download className="size-4.5" />
				{t('common:receiver.download')}
			</Button>
		</div>
	)
}
