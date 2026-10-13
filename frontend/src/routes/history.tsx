import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon } from 'lucide-react'
import { useTranslation } from '../i18n'
import { TransferHistoryRow } from '../components/history/TransferHistoryRow'
import { BackArrowIcon } from '../components/back-arrow-icon'
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { Button } from '../components/ui/button'
import { ScrollArea } from '../components/ui/scroll-area'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { Screen, ScreenBody, ScreenTitle } from '../components/ui/surface'
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from '../components/ui/select'
import { toastManager } from '../components/ui/toast'
import { listPairedDevices } from '../lib/pairing-api'
import { IS_ANDROID, IS_PAIRING_CAPABLE } from '../lib/platform'
import { listen, revealItemInDir, type UnlistenFn } from '../lib/platform-api'
import { resolveAndroidOpenTarget } from '../lib/history-open-target'
import { openDownloadFolder, openDownloadTarget } from '../plugins/nativeUtils'
import { AppAlertDialog } from '../components/AppAlertDialog'
import { formatFileSize } from '../lib/utils'
import { formatReceiveSavePath } from '../lib/receive-save-path'
import {
	filterTransferHistory,
	TRANSFER_STATUS_FILTERS,
	type TransferRecord,
	type TransferStatusFilter,
} from '../lib/transfer-history'
import {
	clearTransferHistory,
	clearTransferTempData,
	deleteTransferRecord,
	getTransferTempData,
	listTransferHistory,
	transferOpenTarget,
	type TransferTempData,
} from '../lib/transfer-history-api'

interface KnownDevice {
	endpoint_id: string
	display_name: string
}

export function HistoryPage() {
	const { t } = useTranslation()
	const [records, setRecords] = useState<TransferRecord[]>([])
	const [pairedDevices, setPairedDevices] = useState<KnownDevice[]>([])
	const [tempData, setTempData] = useState<Record<string, TransferTempData>>({})
	const [status, setStatus] = useState<TransferStatusFilter>('all')
	const [isLoading, setIsLoading] = useState(true)
	const [loadError, setLoadError] = useState(false)
	const [isBusy, setIsBusy] = useState(false)
	const [confirmClearAll, setConfirmClearAll] = useState(false)
	const [pendingRemove, setPendingRemove] = useState<TransferRecord | null>(
		null
	)
	const [missingTarget, setMissingTarget] = useState<TransferRecord | null>(
		null
	)

	const refresh = useCallback(async () => {
		const rows = await listTransferHistory()
		setRecords(rows)

		// Stat'd live, not trusted from the row — a store can vanish any time.
		const reclaimable = rows.filter((row) => row.resumableStorePath)
		const stats = await Promise.all(
			reclaimable.map(async (row) => {
				try {
					return [row.id, await getTransferTempData(row.id)] as const
				} catch {
					return null
				}
			})
		)
		setTempData(Object.fromEntries(stats.filter((entry) => entry !== null)))
	}, [])

	const loadHistory = useCallback(async () => {
		setIsLoading(true)
		setLoadError(false)
		try {
			const devices = IS_PAIRING_CAPABLE
				? await listPairedDevices().catch(() => [])
				: []
			setPairedDevices(devices as KnownDevice[])
			await refresh()
		} catch (error) {
			console.error('Failed to load transfer history:', error)
			// A failed read is not an empty history. Saying "Nothing here yet"
			// after an engine error hides a real problem, so this is its own
			// state with a way to try again.
			setLoadError(true)
		} finally {
			setIsLoading(false)
		}
	}, [refresh])

	useEffect(() => {
		void loadHistory()
	}, [loadHistory])

	// A trusted device can land a transfer while this list is open. The shell
	// announces a row only once it is terminal, so this re-reads the store
	// rather than tracking transfer state of its own.
	useEffect(() => {
		let cancelled = false
		let unlisten: UnlistenFn | undefined
		void listen('transfer-history-updated', () => {
			refresh().catch((error) => {
				console.error('Failed to refresh transfer history:', error)
			})
		}).then((fn) => {
			// Resolved after unmount: nothing left to notify, so drop it.
			if (cancelled) {
				fn()
				return
			}
			unlisten = fn
		})
		return () => {
			cancelled = true
			unlisten?.()
		}
	}, [refresh])

	const visible = useMemo(
		() => filterTransferHistory(records, status),
		[records, status]
	)

	const handleRemove = async (id: string) => {
		setIsBusy(true)
		try {
			await deleteTransferRecord(id)
			await refresh()
			setPendingRemove(null)
		} catch (error) {
			console.error(error)
			toastManager.add({
				title: t('common:history.removeFailed'),
				type: 'error',
			})
		} finally {
			setIsBusy(false)
		}
	}

	/**
	 * Android paths are labels rather than locations, so there the row's own
	 * recorded target is followed and the system reports what it cannot open.
	 * Everywhere else the destination is checked first: a folder that outlived
	 * the files it held would otherwise open to nothing.
	 */
	const handleOpen = async (record: TransferRecord) => {
		try {
			if (IS_ANDROID) {
				const target = resolveAndroidOpenTarget(record)
				if (!target) {
					setMissingTarget(record)
					return
				}
				if (target.kind === 'folder') {
					await openDownloadFolder(target.treeUri)
				} else {
					await openDownloadTarget('', target.relativePath)
				}
				return
			}

			const path = await transferOpenTarget(record.id)
			if (!path) {
				setMissingTarget(record)
				return
			}
			await revealItemInDir(path)
		} catch (error) {
			console.error(error)
			toastManager.add({
				title: t('common:history.row.openFailed'),
				type: 'error',
			})
		}
	}

	const handleClearTempData = async (id: string) => {
		setIsBusy(true)
		try {
			await clearTransferTempData(id)
			await refresh()
			toastManager.add({
				title: t('common:history.temp.cleared'),
				type: 'success',
			})
		} catch (error) {
			console.error(error)
			toastManager.add({
				title:
					error instanceof Error
						? error.message
						: t('common:history.temp.clearFailed'),
				type: 'error',
			})
		} finally {
			setIsBusy(false)
		}
	}

	const handleClearAll = async () => {
		setIsBusy(true)
		try {
			await clearTransferHistory()
			await refresh()
			setConfirmClearAll(false)
			toastManager.add({
				title: t('common:history.clearAllDone'),
				type: 'success',
			})
		} catch (error) {
			console.error(error)
			toastManager.add({
				title: t('common:history.clearAllFailed'),
				type: 'error',
			})
		} finally {
			setIsBusy(false)
		}
	}

	return (
		<Screen>
			{/* Back + title as one target, plus a real screen heading below so the
			    destination is unmistakable. */}
			<div className="flex items-center justify-between gap-2 pt-[calc(0.5rem+var(--safe-area-top))]">
				<Link
					to="/"
					aria-label={t('common:back')}
					className="-ml-2 flex size-11 items-center justify-center rounded-full text-muted-foreground active:bg-accent"
				>
					<BackArrowIcon size={20} />
				</Link>
				{records.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						disabled={isBusy}
						onClick={() => setConfirmClearAll(true)}
						className="text-muted-foreground"
					>
						{t('common:history.clearAll')}
					</Button>
				)}
			</div>

			<ScreenBody>
				<div className="flex flex-col gap-1">
					<ScreenTitle>{t('common:history.title')}</ScreenTitle>
					{/* One timeline, each row carries its own direction arrow, so
					    direction is not a filter. Status is the only filter and
					    usually stays on "All" — hence a dropdown, not chips. */}
					<div className="mt-2 flex items-center gap-2">
						<Select value={status}>
							<SelectTrigger size="sm" className="w-44">
								<SelectValue placeholder={t('common:history.filters.all')}>
									{(value: string | null) =>
										t(`common:history.filters.${value ?? 'all'}`)
									}
								</SelectValue>
							</SelectTrigger>
							<SelectPopup>
								{TRANSFER_STATUS_FILTERS.map((option) => (
									<SelectItem
										key={option}
										value={option}
										onClick={() => setStatus(option)}
									>
										{t(`common:history.filters.${option}`)}
									</SelectItem>
								))}
							</SelectPopup>
						</Select>
						<span className="text-callout text-muted-foreground tabular-nums">
							{t('common:history.filters.count', { count: visible.length })}
						</span>
					</div>
				</div>

				<div className="min-h-0 flex-1">
					<ScrollArea className="h-full">
						{isLoading ? (
							<LoadingState label={t('common:loading')} />
						) : loadError ? (
							<ErrorState
								title={t('common:history.errorTitle')}
								description={t('common:history.errorDescription')}
								retryLabel={t('retry')}
								onRetry={() => {
									void loadHistory()
								}}
							/>
						) : visible.length === 0 ? (
							<EmptyState
								icon={<HistoryIcon />}
								title={t('common:history.empty.title')}
								description={
									status === 'all'
										? t('common:history.empty.description')
										: t('common:history.empty.filtered')
								}
							/>
						) : (
							<div className="flex flex-col">
								{visible.map((record) => (
									<TransferHistoryRow
										key={record.id}
										record={record}
										pairedDevices={pairedDevices}
										tempData={tempData[record.id]}
										onOpen={handleOpen}
										onRemove={setPendingRemove}
										onClearTempData={handleClearTempData}
										isBusy={isBusy}
									/>
								))}
							</div>
						)}
					</ScrollArea>
				</div>
			</ScreenBody>

			<AlertDialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t('common:history.clearAllConfirmTitle')}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t('common:history.clearAllConfirmBody')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmClearAll(false)}
							disabled={isBusy}
						>
							{t('common:cancel')}
						</Button>
						<Button
							variant="destructive"
							onClick={handleClearAll}
							disabled={isBusy}
						>
							{t('common:history.clearAll')}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={pendingRemove !== null}
				onOpenChange={(open) => {
					if (!open) setPendingRemove(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t('common:history.row.removeConfirmTitle')}
						</AlertDialogTitle>
						{/* Deleting a row also reclaims its partial store, so a row
						    holding one gets the stronger warning. */}
						<AlertDialogDescription>
							{pendingRemove && tempData[pendingRemove.id]?.exists
								? t('common:history.row.removeConfirmBodyResumable', {
										size: formatFileSize(tempData[pendingRemove.id].sizeBytes),
									})
								: t('common:history.row.removeConfirmBody')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setPendingRemove(null)}
							disabled={isBusy}
						>
							{t('common:cancel')}
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (pendingRemove) void handleRemove(pendingRemove.id)
							}}
							disabled={isBusy}
						>
							{t('common:history.row.remove')}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AppAlertDialog
				isOpen={missingTarget !== null}
				title={t('common:history.row.missingTitle')}
				description={t('common:history.row.missingBody', {
					path:
						formatReceiveSavePath(missingTarget?.savePath) ||
						t('common:history.row.unknownDestination'),
				})}
				type="error"
				onClose={() => setMissingTarget(null)}
			/>
		</Screen>
	)
}
