import type { TransferProgress } from '../types/transfer'

/**
 * What the transfer ring should draw, derived only from what the engine said.
 *
 * Kept out of the component because this is state logic rather than view logic:
 * the rule that decides between "moving", "unknown", "finished" and "stopped"
 * is worth testing directly, and it is the rule most likely to be got wrong by
 * anyone reaching for a shortcut.
 *
 * The engine emits progress as `<bytesDone>:<bytesTotal>:<speedBps*1000>`
 * (see `engine/protocol/src/progress.rs`), parsed by `parseProgressPayload`.
 */

export type TransferProgressPhase =
	| 'transferring'
	| 'indeterminate'
	| 'complete'
	| 'error'
	| 'cancelled'

export interface TransferProgressStateOptions {
	/**
	 * The engine emitted `transfer-completed` / `receive-completed`.
	 *
	 * Deliberately a separate signal from the byte count: reaching 100% of the
	 * bytes means the data arrived, not that the transfer was verified and
	 * published, so only this can draw a finished ring.
	 */
	isComplete?: boolean
	/** Engine-reported failure, shown to the user verbatim. */
	error?: string
	isCancelled?: boolean
}

/**
 * Speed below this is noise. The engine windows it over three seconds and lets
 * it decay toward zero on a stall, so a paused transfer lands here rather than
 * printing "0.00 KB/s" on every tick.
 */
export const MIN_REPORTED_SPEED_BPS = 1

/**
 * Resolves the phase the ring should render.
 *
 * `totalBytes` of zero means "the engine has not reported a size yet", not
 * "there is nothing to send". A genuinely empty selection still ends in an
 * engine-confirmed completion, which is the only thing that draws the finished
 * ring, so nothing is misreported while that is outstanding.
 */
export function resolveTransferPhase(
	progress: TransferProgress | null,
	options: TransferProgressStateOptions = {}
): TransferProgressPhase {
	if (options.isComplete) return 'complete'
	if (options.error) return 'error'
	if (options.isCancelled) return 'cancelled'
	if (!progress) return 'indeterminate'
	if (!Number.isFinite(progress.totalBytes) || progress.totalBytes <= 0) {
		return 'indeterminate'
	}
	return 'transferring'
}

/** Clamped 0..100. The engine's own percentage can overshoot on a re-send. */
export function clampPercentage(progress: TransferProgress | null): number {
	if (!progress) return 0
	return Math.min(Math.max(progress.percentage, 0), 100)
}

/** Whether a speed reading is worth showing rather than reading as zero. */
export function hasReportableSpeed(progress: TransferProgress | null): boolean {
	return (progress?.speedBps ?? 0) >= MIN_REPORTED_SPEED_BPS
}

/**
 * Whether an ETA is worth showing.
 *
 * Needs a determinate phase (otherwise there is no total to work towards), a
 * positive speed, and a finite estimate. `parseProgressPayload` already omits
 * `etaSeconds` when the transfer is stalled; this is the second gate.
 */
export function hasReportableEta(
	progress: TransferProgress | null,
	phase: TransferProgressPhase
): boolean {
	if (phase !== 'transferring') return false
	const eta = progress?.etaSeconds
	return (
		eta !== undefined &&
		Number.isFinite(eta) &&
		eta > 0 &&
		hasReportableSpeed(progress)
	)
}

export function formatSpeed(speedBps: number): string {
	const mbps = speedBps / (1024 * 1024)
	const kbps = speedBps / 1024
	if (mbps >= 1) {
		return `${mbps.toFixed(2)} MB/s`
	}
	return `${kbps.toFixed(2)} KB/s`
}
