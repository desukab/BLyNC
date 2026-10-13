import { LanguageSelect } from '../components/settings/language-select/language-select'
import { ThemeSelectRadio } from '../components/settings/theme-select-radio/theme-select-radio'

export function SettingsPage() {
	return (
		<>
			<LanguageSelect />
			<ThemeSelectRadio />
		</>
	)
}
