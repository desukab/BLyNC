import { TransferPage } from './transfer'

/**
 * Send is its own screen. It used to share one component with Receive behind a
 * segmented control; see `./transfer` for why they were split.
 */
export function IndexPage() {
	return <TransferPage mode="send" />
}
