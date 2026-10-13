import { useTranslation } from '../../../i18n'
import { IS_ANDROID } from '../../../lib/platform'
import { ToggleGroup, ToggleRow } from '../../ui/toggle-group'
import { useAppSettingStore } from '../../../store/app-setting'

/**
 * The relay indicator toggle.
 *
 * This switch controls a button in the desktop footer rail. On Android the
 * footer collapses to a single version/attribution line and does not render
 * the relay button at all, so leaving the setting on the phone offered a
 * toggle that changed nothing. The relay status itself is always visible under
 * Infra, so nothing is hidden by not offering it here.
 */
export function RelayStatusSettings() {
	const { t } = useTranslation()
	const showRelayStatus = useAppSettingStore((state) => state.showRelayStatus)
	const setShowRelayStatus = useAppSettingStore(
		(state) => state.setShowRelayStatus
	)

	if (IS_ANDROID) return null

	return (
		<ToggleGroup label={t('settings.general.relayStatus.title')}>
			<ToggleRow
				label={t('settings.general.relayStatus.showToggle.label')}
				description={t('settings.general.relayStatus.showToggle.description')}
				checked={showRelayStatus}
				onCheckedChange={setShowRelayStatus}
			/>
		</ToggleGroup>
	)
}
