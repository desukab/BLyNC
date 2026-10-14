import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseProgressPayload } from './transfer-events.js'
import type { TransferProgress } from '../types/transfer.js'
import {
	clampPercentage,
	formatSpeed,
	hasReportableEta,
	hasReportableSpeed,
	resolveTransferPhase,
} from './transfer-progress.js'

/** The exact wire format `engine/protocol/src/progress.rs` emits. */
const fromEngine = (done: number, total: number, speedBps: number) =>
	parseProgressPayload(
		`${done}:${total}:${Math.round(speedBps * 1000)}`
	) as TransferProgress

describe('transfer progress phase', () => {
	it('is transferring once the engine has reported a total', () => {
		const progress = fromEngine(70_000_000, 200_000_000, 2_400_000)
		assert.equal(resolveTransferPhase(progress), 'transferring')
	})

	it('is indeterminate when the engine has not reported a size yet', () => {
		const progress = fromEngine(0, 0, 0)
		assert.equal(resolveTransferPhase(progress), 'indeterminate')
		assert.equal(resolveTransferPhase(null), 'indeterminate')
	})

	it('never reports completion from the byte count alone', () => {
		// Every byte has arrived, but the engine has not confirmed the transfer.
		// The ring must keep saying "transferring" - verification happens after
		// the bytes land, and only a completion event may claim it.
		const progress = fromEngine(200_000_000, 200_000_000, 2_400_000)
		assert.equal(clampPercentage(progress), 100)
		assert.equal(resolveTransferPhase(progress), 'transferring')
		assert.equal(
			resolveTransferPhase(progress, { isComplete: true }),
			'complete'
		)
	})

	it('reports complete for an empty transfer only on the engine event', () => {
		const empty = fromEngine(0, 0, 0)
		assert.equal(resolveTransferPhase(empty), 'indeterminate')
		assert.equal(resolveTransferPhase(empty, { isComplete: true }), 'complete')
	})

	it('separates a failure from a cancellation', () => {
		const progress = fromEngine(1_000_000, 200_000_000, 1_000_000)
		assert.equal(
			resolveTransferPhase(progress, { error: 'peer gone' }),
			'error'
		)
		assert.equal(
			resolveTransferPhase(progress, { isCancelled: true }),
			'cancelled'
		)
	})

	it('prefers a failure over a cancellation', () => {
		const progress = fromEngine(1_000_000, 200_000_000, 1_000_000)
		assert.equal(
			resolveTransferPhase(progress, { error: 'boom', isCancelled: true }),
			'error'
		)
	})
})

describe('transfer progress readouts', () => {
	it('clamps a percentage that overshot rather than drawing past the ring', () => {
		assert.equal(clampPercentage(fromEngine(300, 200, 0)), 100)
		assert.equal(clampPercentage(fromEngine(-5, 200, 0)), 0)
	})

	it('reports no ETA while the transfer is stalled', () => {
		// SpeedMeter decays toward zero on a stall and parseProgressPayload then
		// omits etaSeconds, so an ETA here would be a guess.
		const stalled = fromEngine(100_000_000, 200_000_000, 0)
		const phase = resolveTransferPhase(stalled)
		assert.equal(hasReportableSpeed(stalled), false)
		assert.equal(hasReportableEta(stalled, phase), false)
	})

	it('reports speed and ETA while bytes are moving', () => {
		const moving = fromEngine(70_000_000, 200_000_000, 2_400_000)
		const phase = resolveTransferPhase(moving)
		assert.equal(hasReportableSpeed(moving), true)
		assert.equal(hasReportableEta(moving, phase), true)
		// 130 MB left at 2.4 MB/s.
		assert.ok(Math.abs((moving.etaSeconds ?? 0) - 54.16) < 0.01)
	})

	it('claims no ETA while the size is unknown', () => {
		const unknown = fromEngine(0, 0, 0)
		assert.equal(
			hasReportableEta(unknown, resolveTransferPhase(unknown)),
			false
		)
	})

	it('formats speed in the unit a person would read it in', () => {
		assert.equal(formatSpeed(2 * 1024 * 1024), '2.00 MB/s')
		assert.equal(formatSpeed(512 * 1024), '512.00 KB/s')
	})
})
