import type * as React from 'react'
import { ListGroup, ListRow, Section } from './surface'
import { Switch } from './switch'

/**
 * A settings group that is nothing but a set of on/off switches.
 *
 * Most of the General screen is exactly this shape, but each one was hand-built
 * as its own card with its own spacing, so the switches drifted out of
 * alignment down the page. Routing them all through one component is what makes
 * the screen feel like a single designed surface rather than a stack of
 * unrelated boxes.
 */
export function ToggleRow({
	label,
	description,
	checked,
	onCheckedChange,
	disabled,
}: {
	label: React.ReactNode
	description?: React.ReactNode
	checked: boolean
	onCheckedChange: (checked: boolean) => void
	disabled?: boolean
}) {
	return (
		<ListRow
			label={label}
			description={description}
			trailing={
				<Switch
					checked={checked}
					onCheckedChange={onCheckedChange}
					disabled={disabled}
				/>
			}
		/>
	)
}

export function ToggleGroup({
	label,
	description,
	children,
	className,
}: {
	label?: React.ReactNode
	description?: React.ReactNode
	children: React.ReactNode
	className?: string
}) {
	return (
		<Section label={label} description={description} className={className}>
			<ListGroup>{children}</ListGroup>
		</Section>
	)
}
