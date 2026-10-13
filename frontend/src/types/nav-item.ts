import type { IconName } from '../components/icons'

export type NavItemType = 'core' | 'integration'

export type NestedItemProps = {
	label: string
	to: string
	translationNs?: string
}

export type INavItem = {
	icon?: IconName
	label: string
	to: string
	items?: NestedItemProps[]
	type?: NavItemType
	from?: string
	nested?: string
	translationNs?: string
	/**
	 * Fully-qualified key for a short label used where the full one does not
	 * fit — the settings section row on a narrow phone. English-only by
	 * design: it is an abbreviation of the same word, not a translation.
	 */
	shortTranslationNs?: string
	disable?: boolean
	beta?: boolean
	comingSoon?: boolean
}
