import { useTranslation } from '../../../i18n'
import { useAppSettingStore } from '../../../store/app-setting'
import { ToggleGroup, ToggleRow } from '../../ui/toggle-group'

export function Notifications() {
	const { t } = useTranslation()
	const enabled = useAppSettingStore((state) => state.enableNotifications)
	const setEnabled = useAppSettingStore((state) => state.setEnableNotifications)

	return (
		<ToggleGroup>
			<ToggleRow
				label={t('settings.general.notifications.label')}
				description={t('settings.general.notifications.description')}
				checked={enabled}
				onCheckedChange={setEnabled}
			/>
		</ToggleGroup>
	)
}
