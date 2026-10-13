import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Receiver } from '@/components/receiver/Receiver'
import { useReceiverContext } from '@/components/receiver/ReceiverProvider'
import { Sender } from '@/components/sender/Sender'
import {
	Screen,
	ScreenBody,
	ScreenSubtitle,
	ScreenTitle,
	Section,
} from '@/components/ui/surface'
import { toastManager } from '@/components/ui/toast'
import { useTranslation } from '@/i18n'
import { invoke, listen, listenForReceiveLinks } from '@/lib/platform-api'
import { ticketFromReceiveLink } from '@/lib/receive-link'
import { relayFallbackToastDescriptionKey } from '@/lib/relay-fallback-toast'
import { useSenderStore } from '@/store/sender-store'
import { useTransferTabStore } from '@/store/transfer-tab-store'

type Mode = 'send' | 'receive'

/**
 * Send and Receive are two destinations, not two tabs in one card.
 *
 * They used to be the same component with a segmented control inside a bordered
 * panel, which meant the app's two halves of equal weight were nested inside a
 * single screen with a dropdown-shaped way to switch. Each is now its own
 * route with its own heading and its own state, and the tab bar switches
 * between them.
 *
 * `/` and `/receive` both mount this, distinguished by `mode`, so the transfer
 * stores, listeners and intent handling stay in exactly one place.
 */
export function TransferPage({ mode }: { mode: Mode }) {
	// Each child reports whether it is mid-transfer so the other one can be
	// locked out of the navigation, matching the old tab behaviour.
	const [, setIsSharing] = useState(false)
	const [, setIsReceiving] = useState(false)
	const isInitialRender = useRef(false)
	const { t } = useTranslation()
	const { handleTicketChange } = useReceiverContext()
	const navigate = useNavigate()
	const location = useLocation()

	// Store actions
	const setSelectedPath = useSenderStore((state) => state.setSelectedPath)
	const setPathType = useSenderStore((state) => state.setPathType)
	const requestedTab = useTransferTabStore((state) => state.requestedTab)
	const clearRequestedTab = useTransferTabStore(
		(state) => state.clearRequestedTab
	)

	/**
	 * A receive deep link (app.dashbeam.net/receive?…) or a paired-device invite
	 * can land on either route, and the sender has to hand off to the receiver.
	 * `requestedTab` is what those paths already set, so it is honoured here
	 * rather than threading a second mechanism through the same code.
	 */
	useEffect(() => {
		if (!requestedTab) return
		if (requestedTab !== mode) {
			navigate(requestedTab === 'receive' ? '/receive' : '/', { replace: true })
		}
		clearRequestedTab()
	}, [requestedTab, mode, clearRequestedTab, navigate])

	useEffect(() => {
		if (mode !== 'receive') return

		const applyReceiveLink = (url: string) => {
			const ticket = ticketFromReceiveLink(url)
			if (!ticket) return
			handleTicketChange(ticket)
			if (location.pathname !== '/receive') {
				navigate('/receive', { replace: true })
			}
		}

		const unlisten = listenForReceiveLinks(applyReceiveLink)
		return () => {
			void unlisten.then((stop) => stop())
		}
	}, [handleTicketChange, mode, navigate, location.pathname])

	useEffect(() => {
		isInitialRender.current = true

		// A share intent is only meaningful on the Send screen.
		const applyIntent = async (path: string) => {
			setSelectedPath(path)
			try {
				const type = await invoke<string>('check_path_type', { path })
				setPathType(type as 'file' | 'directory')
			} catch {
				setPathType(null)
			}
			if (mode === 'receive') {
				navigate('/', { replace: true })
			}
		}

		if (mode === 'send') {
			invoke<string | null>('check_launch_intent')
				.then((path) => {
					if (path) applyIntent(path)
				})
				.catch((e) => console.error('Failed to check launch intent:', e))
		}

		const unlistenPromise = listen<string>('launch-intent', (event) => {
			if (event.payload) applyIntent(event.payload)
		})

		// Surface the custom->public relay fallback at transfer time so a user who
		// chose "custom for privacy" is not silently put on public relays.
		const unlistenFellBackPromise = listen<string>(
			'relay-fell-back',
			(event) => {
				const descriptionKey = relayFallbackToastDescriptionKey(event.payload)
				if (!descriptionKey) {
					return
				}

				toastManager.add({
					title: t('footer.relay.fellBackToastTitle'),
					description: t(descriptionKey),
					type: 'warning',
				})
			}
		)

		return () => {
			unlistenPromise.then((unlisten) => unlisten())
			unlistenFellBackPromise.then((unlisten) => unlisten())
		}
	}, [setSelectedPath, setPathType, t, mode, navigate])

	const heading = mode === 'send' ? t('common:send') : t('common:receive')
	const subheading =
		mode === 'send'
			? t('common:sender.subtitle')
			: t('common:receiver.subtitle')

	return (
		<Screen>
			<ScreenBody>
				<div className="flex flex-col gap-1">
					<ScreenTitle>{heading}</ScreenTitle>
					<ScreenSubtitle>{subheading}</ScreenSubtitle>
				</div>

				{mode === 'send' ? (
					<Section className="min-h-0 flex-1">
						<Sender onTransferStateChange={setIsSharing} />
					</Section>
				) : (
					<Section className="min-h-0 flex-1">
						<Receiver onTransferStateChange={setIsReceiving} />
					</Section>
				)}
			</ScreenBody>
		</Screen>
	)
}
