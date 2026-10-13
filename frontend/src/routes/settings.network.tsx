import { DiscoverySettings, RelaySettings } from '../components/settings/relay'
import { DiscoverabilitySetting } from '../components/settings/discoverability'

export function SettingNetworkPage() {
	return (
		<>
			<DiscoverabilitySetting />
			<RelaySettings />
			<DiscoverySettings />
		</>
	)
}
