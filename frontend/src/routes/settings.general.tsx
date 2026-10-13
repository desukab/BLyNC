import { AutoUpdate } from '../components/settings/auto-update'
import { BroadcastSettings } from '../components/settings/broadcast'
import { DebugMode } from '../components/settings/debug-mode'
import { Notifications } from '../components/settings/notifications'
import { RelayStatusSettings } from '../components/settings/relay-status'
import { SystemTray } from '../components/settings/system-tray/system-tray'
import { TransferHistorySettings } from '../components/settings/transfer-history'
import { IS_DESKTOP, IS_TAURI, IS_UPDATER_AVAILABLE } from '@/lib/platform'

export function SettingGeneralPage() {
	return (
		<>
			<BroadcastSettings />
			<RelayStatusSettings />
			{IS_TAURI && <Notifications />}
			{IS_DESKTOP && <SystemTray />}
			{IS_TAURI && <TransferHistorySettings />}
			{IS_UPDATER_AVAILABLE && <AutoUpdate />}
			<DebugMode />
		</>
	)
}
