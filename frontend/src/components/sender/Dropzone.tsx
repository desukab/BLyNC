import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FilePlus, FolderPlus, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../i18n/react-i18next-compat'
import type { DropzoneProps } from '../../types/sender'
import { invoke } from '@/lib/platform-api'
import { getPreviewFileIcon } from '../../lib/fileIcons'
import { Button } from '../ui/button'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '../ui/menu'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip'

const getPathBaseName = (path: string) => {
	const normalized = path.replace(/\\/g, '/')
	return normalized.split('/').pop() ?? path
}

/**
 * The selection surface for Send.
 *
 * This replaces a 2px dashed drop-target that also doubled as a button, wrapped
 * an upload glyph at 1.85x scale, and sat above two more buttons offering the
 * same two actions — three competing affordances for one job.
 *
 * The rule now: on a phone the card *is* the file picker (tap anywhere on it),
 * drag-and-drop highlight only appears on a pointer device that can actually
 * drag, and adding more items moves into the overflow menu so the card stays
 * clean when something is already selected.
 */
export function Dropzone({
	isDragActive,
	selectedPaths,
	selectedPath,
	pathType,
	showFullPath,
	isLoading,
	onToggleFullPath,
	onAddFiles,
	onAddFolders,
	onRemoveSelectedPath,
	onClearSelection,
	onEmptyClick,
	dropzoneDragProps,
}: DropzoneProps) {
	const { t } = useTranslation()
	const hasSelection = selectedPaths.length > 0
	const [mimeTypesByPath, setMimeTypesByPath] = useState<
		Record<string, string>
	>({})
	const previewScrollerRef = useRef<HTMLDivElement | null>(null)
	const previewScrollerCleanupRef = useRef<(() => void) | null>(null)
	const [_canScrollLeft, setCanScrollLeft] = useState(false)
	const [_canScrollRight, setCanScrollRight] = useState(false)

	useEffect(() => {
		if (!selectedPaths.length) {
			setMimeTypesByPath({})
			return
		}

		let mounted = true
		void (async () => {
			try {
				const mimeTypes = await invoke<(string | null)[]>(
					'get_paths_mime_types',
					{ paths: selectedPaths }
				)
				if (!mounted) return

				const nextMap: Record<string, string> = {}
				for (const [index, path] of selectedPaths.entries()) {
					const mimeType = mimeTypes[index]
					if (mimeType) nextMap[path] = mimeType
				}
				setMimeTypesByPath(nextMap)
			} catch (error) {
				console.error('Failed to resolve mime types for selected paths:', error)
			}
		})()

		return () => {
			mounted = false
		}
	}, [selectedPaths])

	const updateScrollHints = () => {
		const container = previewScrollerRef.current
		if (!container) {
			setCanScrollLeft(false)
			setCanScrollRight(false)
			return
		}

		const { scrollLeft, scrollWidth, clientWidth } = container
		const maxScrollLeft = scrollWidth - clientWidth
		setCanScrollLeft(scrollLeft > 4)
		setCanScrollRight(maxScrollLeft - scrollLeft > 4)
	}

	const attachPreviewScroller = (node: HTMLDivElement | null) => {
		previewScrollerCleanupRef.current?.()
		previewScrollerCleanupRef.current = null
		previewScrollerRef.current = node

		if (!node) {
			updateScrollHints()
			return
		}

		updateScrollHints()
		node.addEventListener('scroll', updateScrollHints, { passive: true })

		previewScrollerCleanupRef.current = () => {
			node.removeEventListener('scroll', updateScrollHints)
		}
	}

	const updateScrollHintsRef = useRef(updateScrollHints)
	updateScrollHintsRef.current = updateScrollHints

	useEffect(() => {
		const handleResize = () => updateScrollHintsRef.current()
		window.addEventListener('resize', handleResize)
		return () => {
			previewScrollerCleanupRef.current?.()
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	const getDropzoneStyles = () => {
		if (isDragActive) {
			return {
				borderColor: 'var(--primary)',
				backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
			}
		}
		return {}
	}

	const getStatusText = () => {
		if (isLoading) return t('common:sender.preparingForTransport')
		if (isDragActive) return t('common:sender.dropFilesHere')
		if (selectedPaths.length > 1) return t('common:sender.itemSelected')
		if (selectedPath) {
			if (pathType === 'directory') return t('common:sender.folderSelected')
			if (pathType === 'file') return t('common:sender.fileSelected')
			return t('common:sender.itemSelected')
		}
		return t('common:sender.dragAndDrop')
	}

	const getSubText = () => {
		if (isLoading) return t('common:sender.pleaseWaitProcessing')
		if (selectedPaths.length > 1) {
			const firstPath = selectedPaths[0]
			const firstName = firstPath ? getPathBaseName(firstPath) : ''
			const extraCount = selectedPaths.length - 1
			return t('common:sender.multipleItemsSelected', {
				count: extraCount,
				firstName:
					firstName.length > 40 ? `${firstName.slice(0, 40)}…` : firstName,
			})
		}
		if (selectedPath) {
			const fileName = getPathBaseName(selectedPath)
			const displayName =
				fileName.length > 60 ? `${fileName.slice(0, 60)}…` : fileName
			return (
				<>
					<button
						type="button"
						onClick={onToggleFullPath}
						title={displayName}
						className="flex items-center justify-center gap-0.5 font-medium"
					>
						{displayName}
						<ChevronDown className={cnChevron(showFullPath)} strokeWidth={2} />
					</button>
					<span
						className="mt-1 block max-sm:hidden break-all text-caption opacity-70 transition-opacity"
						style={{ visibility: showFullPath ? 'visible' : 'hidden' }}
					>
						{selectedPath}
					</span>
				</>
			)
		}
		return t('common:sender.orBrowse')
	}

	const renderPathIcon = (path: string) => {
		const fileName = getPathBaseName(path)
		const mimeType = mimeTypesByPath[path]
		return (
			<div className="origin-center scale-[1.5]">
				{getPreviewFileIcon(mimeType, fileName)}
			</div>
		)
	}

	const handlePreviewWheel = (event: React.WheelEvent<HTMLDivElement>) => {
		const container = event.currentTarget
		if (
			Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
			container.scrollWidth <= container.clientWidth
		) {
			return
		}

		container.scrollLeft += event.deltaY
		event.preventDefault()
	}

	return (
		<TooltipProvider>
			<motion.div
				layout
				transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
				style={getDropzoneStyles()}
				data-slot="selection-card"
				data-active={isDragActive ? 'true' : undefined}
				className="relative flex h-fit min-h-56 flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised text-center transition-colors"
				role={!hasSelection ? 'button' : undefined}
				tabIndex={!hasSelection && !isLoading ? 0 : undefined}
				aria-label={!hasSelection ? t('common:sender.orBrowse') : undefined}
				onClick={() => {
					if (hasSelection || isLoading || !onEmptyClick) return
					void onEmptyClick()
				}}
				onKeyDown={(event) => {
					if (hasSelection || isLoading || !onEmptyClick) return
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault()
						void onEmptyClick()
					}
				}}
				{...dropzoneDragProps}
			>
				{hasSelection && !isLoading ? (
					<>
						<div
							className="absolute top-2 left-2 z-30"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<Menu>
								<MenuTrigger
									render={
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											className="text-muted-foreground/70 hover:text-muted-foreground"
											aria-label={t('common:sender.addMore')}
											title={t('common:sender.addMore')}
										/>
									}
								>
									<Plus className="size-4" strokeWidth={1.75} />
								</MenuTrigger>
								<MenuPopup align="start" side="bottom" sideOffset={6}>
									<MenuItem
										onClick={() => {
											void onAddFiles()
										}}
									>
										<FilePlus />
										{t('common:sender.addFile')}
									</MenuItem>
									<MenuItem
										onClick={() => {
											void onAddFolders()
										}}
									>
										<FolderPlus />
										{t('common:sender.addFolder')}
									</MenuItem>
								</MenuPopup>
							</Menu>
						</div>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={(e) => {
											e.stopPropagation()
											onClearSelection()
										}}
										className="absolute top-2 right-2 z-30 text-muted-foreground"
										aria-label={t('common:sender.clearSelection')}
									/>
								}
							/>
							<TooltipContent>
								<p>{t('common:sender.clearSelection')}</p>
							</TooltipContent>
						</Tooltip>
					</>
				) : null}
				<motion.div
					key={selectedPath ? 'selected' : 'empty'}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="flex h-full w-full flex-col items-center justify-center gap-3 p-5"
				>
					{!hasSelection ? (
						<>
							<div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
								<UploadGlyph />
							</div>
							<div className="flex flex-col gap-1.5">
								{/* With the duplicate browse buttons gone, this card
								    has to state the action outright on a phone as
								    well as on desktop — "drag and drop" means
								    nothing to someone holding the handset. */}
								<p className="text-heading font-medium">
									{t('common:sender.pickSomething')}
								</p>
								<p className="text-sm text-muted-foreground text-pretty">
									{getSubText()}
								</p>
								{/* Drag is a pointer-only affordance, so it is only
								    worth mentioning when a pointer is what is
								    holding the screen. */}
								<p className="hidden text-caption text-muted-foreground/80 sm:block">
									{getStatusText()}
								</p>
							</div>
						</>
					) : (
						<AnimatePresence initial={false}>
							<motion.div
								key="selected-files-preview"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 6 }}
								transition={{ duration: 0.2 }}
								className="flex h-full w-full flex-col items-center justify-center gap-4 pt-4"
							>
								<div
									ref={attachPreviewScroller}
									className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain"
									onWheel={handlePreviewWheel}
								>
									<motion.div
										layout
										className="inline-flex min-w-full justify-center gap-3 px-1"
									>
										<AnimatePresence initial={false}>
											{selectedPaths.map((path) => {
												const fileName = getPathBaseName(path)
												return (
													<motion.div
														key={path}
														layout
														initial={{ opacity: 0, scale: 0.94 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.94 }}
														transition={{ duration: 0.16 }}
														className="group relative w-40 shrink-0"
													>
														<div className="p-1">
															<div className="relative flex h-32 w-full items-center justify-center overflow-hidden">
																{renderPathIcon(path)}
																<Tooltip>
																	<TooltipTrigger
																		render={
																			<button
																				type="button"
																				onClick={(e) => {
																					e.stopPropagation()
																					onRemoveSelectedPath(path)
																				}}
																				className="absolute right-1 top-1 z-10 rounded-full border bg-background p-1 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
																				aria-label={`Remove ${fileName}`}
																			>
																				<X className="h-3.5 w-3.5" />
																			</button>
																		}
																	/>
																	<TooltipContent>
																		<p>
																			{t('common:sender.removeFromSelection')}
																		</p>
																	</TooltipContent>
																</Tooltip>
															</div>
														</div>

														<p className="mt-1 truncate text-sm text-muted-foreground">
															{fileName}
														</p>
													</motion.div>
												)
											})}
										</AnimatePresence>
									</motion.div>
								</div>
								<p className="text-body font-medium text-pretty">
									{getSubText()}
								</p>
							</motion.div>
						</AnimatePresence>
					)}
				</motion.div>
			</motion.div>
		</TooltipProvider>
	)
}

function UploadGlyph() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.6}
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-7"
			aria-hidden="true"
		>
			<path d="M12 16V4" />
			<path d="m7 9 5-5 5 5" />
			<path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
		</svg>
	)
}

function cnChevron(showFullPath: boolean) {
	return [
		'h-4 w-4 transition-transform duration-[var(--duration-fast)]',
		showFullPath ? 'rotate-0' : '-rotate-90',
	].join(' ')
}
