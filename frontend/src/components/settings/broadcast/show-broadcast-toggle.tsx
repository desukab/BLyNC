import { useTranslation } from '../../../i18n'
import { useAppSettingStore } from '../../../store/app-setting'
import { ToggleGroup, ToggleRow } from '../../ui/toggle-group'

export function ShowBroadcastToggle() {
	const { t } = useTranslation()
	const showBroadcastToggle = useAppSettingStore(
		(state) => state.showBroadcastToggle
	)
	const setShowBroadcastToggle = useAppSettingStore(
		(state) => state.setShowBroadcastToggle
	)

	return (
		<ToggleGroup>
			<ToggleRow
				label={t('settings.general.broadcast.showToggle.label')}
				description={t('settings.general.broadcast.showToggle.description')}
				checked={showBroadcastToggle}
				onCheckedChange={setShowBroadcastToggle}
			/>
		</ToggleGroup>
	)
}
