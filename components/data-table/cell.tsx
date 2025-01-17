import type { Row, RowData, Table } from '@tanstack/react-table'
import { type LinkProps } from 'next/link'

import {
  ColumnFormat,
  ColumnFormatOptions,
} from '@/components/data-table/column-defs'
import { formatReadableQuantity } from '@/lib/format-readable'

import { ActionFormat } from './cells/action-format'
import { type Action } from './cells/actions/types'
import { BackgroundBarFormat } from './cells/background-bar-format'
import { BadgeFormat } from './cells/badge-format'
import { BooleanFormat } from './cells/boolean-format'
import { CodeToggleFormat } from './cells/code-toggle-format'
import { ColoredBadgeFormat } from './cells/colored-badge-format'
import { DurationFormat } from './cells/duration-format'
import { LinkFormat } from './cells/link-format'
import { RelatedTimeFormat } from './cells/related-time-format'

export const formatCell = <TData extends RowData, TValue>(
  table: Table<TData>,
  row: Row<TData>,
  value: TValue,
  columnName: string,
  format: ColumnFormat,
  columnFormatOptions?: ColumnFormatOptions
) => {
  switch (format) {
    case ColumnFormat.BackgroundBar:
      return (
        <BackgroundBarFormat
          table={table}
          row={row}
          columnName={columnName}
          value={value}
        />
      )

    case ColumnFormat.ColoredBadge:
      return <ColoredBadgeFormat value={value} />

    case ColumnFormat.Code:
      return <code>{value as string}</code>

    case ColumnFormat.Number:
      return formatReadableQuantity(value as number, 'long')

    case ColumnFormat.NumberShort:
      return formatReadableQuantity(value as number, 'short')

    case ColumnFormat.CodeToggle:
      return <CodeToggleFormat row={row} value={value} />

    case ColumnFormat.RelatedTime:
      return <RelatedTimeFormat value={value} />

    case ColumnFormat.Duration:
      return <DurationFormat value={value} />

    case ColumnFormat.Boolean:
      return <BooleanFormat value={value} />

    case ColumnFormat.Action:
      return (
        <ActionFormat
          row={row}
          value={value}
          actions={columnFormatOptions as Action[]}
        />
      )

    case ColumnFormat.Badge:
      return <BadgeFormat value={value} />

    case ColumnFormat.Link:
      return (
        <LinkFormat
          row={row}
          value={value}
          options={columnFormatOptions as LinkProps}
        />
      )

    default:
      return <span className="text-nowrap">{value as string}</span>
  }
}
