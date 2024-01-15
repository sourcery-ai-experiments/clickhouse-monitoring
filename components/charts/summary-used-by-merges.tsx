import Link from 'next/link'
import { ArrowRightIcon } from '@radix-ui/react-icons'

import { fetchData } from '@/lib/clickhouse'
import { ChartCard } from '@/components/chart-card'
import { type ChartProps } from '@/components/charts/chart-props'
import {
  CardMultiMetrics,
  type CardMultiMetricsProps,
} from '@/components/tremor/card-multi-metrics'

export async function ChartSummaryUsedByMerges({
  title,
  className,
}: ChartProps) {
  const usedSql = `
    SELECT
      SUM(memory_usage) as memory_usage,
      formatReadableSize(memory_usage) as readable_memory_usage
    FROM system.merges
  `
  const usedRows = await fetchData(usedSql)
  const used = usedRows?.[0]
  if (!usedRows || !used) return null

  // Workaround for getting total memory usage
  const totalMemSql = `
    SELECT metric, value as total, formatReadableSize(total) AS readable_total
    FROM system.asynchronous_metrics
    WHERE
        metric = 'CGroupMemoryUsed'
        OR metric = 'OSMemoryTotal'
    ORDER BY metric ASC
    LIMIT 1
  `
  let totalMem = {
    total: used.memory_usage,
    readable_total: used.readable_memory_usage,
  }
  try {
    const rows = await fetchData(totalMemSql)
    if (!rows) return null
    totalMem = rows?.[0]
  } catch (e) {
    console.error('Error fetching total memory usage', e)
  }

  let rowsReadWritten = {
    rows_read: 0,
    rows_written: 0,
    readable_rows_read: '0',
    readable_rows_written: '0',
  }
  const rowsReadWrittenSql = `
    SELECT SUM(rows_read) as rows_read,
           SUM(rows_written) as rows_written,
           formatReadableQuantity(rows_read) as readable_rows_read,
           formatReadableQuantity(rows_written) as readable_rows_written
    FROM system.merges
  `
  try {
    const rows = await fetchData(rowsReadWrittenSql)
    if (!!rows) {
      rowsReadWritten = rows?.[0]
    }
  } catch (e) {
    console.error('Error fetching rows read', e)
  }

  let bytesReadWritten = {
    bytes_read: 0,
    bytes_written: 0,
    readable_bytes_read: '0',
    readable_bytes_written: '0',
  }
  const bytesReadWrittenSql = `
    SELECT SUM(bytes_read_uncompressed) as bytes_read,
           SUM(bytes_written_uncompressed) as bytes_written,
           formatReadableSize(bytes_read) as readable_bytes_read,
           formatReadableSize(bytes_written) as readable_bytes_written
    FROM system.merges
  `
  try {
    const rows = await fetchData(bytesReadWrittenSql)
    if (!!rows) {
      bytesReadWritten = rows?.[0]
    }
  } catch (e) {
    console.error('Error fetching bytes read', e)
  }

  const sql = `
    Current memory used by merges:
    ${usedSql}

    Total memory used by merges estimated from CGroupMemoryUsed or OSMemoryTotal:
    ${totalMemSql}

    Rows read and written by merges:
    ${rowsReadWrittenSql}

    Bytes read and written by merges:
    ${bytesReadWrittenSql}
  `

  const items: CardMultiMetricsProps['items'] = []

  if (rowsReadWritten.rows_read < rowsReadWritten.rows_written) {
    items.push({
      current: rowsReadWritten.rows_read,
      target: rowsReadWritten.rows_written,
      currentReadable: rowsReadWritten.readable_rows_read + ' rows read',
      targetReadable: rowsReadWritten.readable_rows_written + ' rows written',
    })
  } else {
    items.push({
      current: rowsReadWritten.rows_written,
      target: rowsReadWritten.rows_read,
      currentReadable: rowsReadWritten.readable_rows_written + ' rows written',
      targetReadable: rowsReadWritten.readable_rows_read + ' rows read',
    })
  }

  if (bytesReadWritten.bytes_read < bytesReadWritten.bytes_written) {
    items.push({
      current: bytesReadWritten.bytes_read,
      target: bytesReadWritten.bytes_written,
      currentReadable:
        bytesReadWritten.readable_bytes_read + ' read (uncompressed)',
      targetReadable:
        bytesReadWritten.readable_bytes_written + ' written (uncompressed)',
    })
  } else {
    items.push({
      current: bytesReadWritten.bytes_written,
      target: bytesReadWritten.bytes_read,
      currentReadable:
        bytesReadWritten.readable_bytes_written + ' written (uncompressed)',
      targetReadable:
        bytesReadWritten.readable_bytes_read + ' read (uncompressed)',
    })
  }

  items.push({
    current: used.memory_usage,
    target: totalMem.total,
    currentReadable: used.readable_memory_usage + ' memory used',
    targetReadable: totalMem.readable_total + ' total',
  })

  return (
    <ChartCard title={title} className={className} sql={sql}>
      <div className="flex flex-col justify-between p-0">
        <CardMultiMetrics
          primary={
            <span className="flex flex-row items-center gap-2">
              {rowsReadWritten.readable_rows_read} rows read,{' '}
              {used.readable_memory_usage} memory used for merges
              <Link href="/merges" className="inline">
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </span>
          }
          items={items}
          className="p-2"
        />
        <div className="text-muted-foreground text-right text-sm">
          Total memory used by merges estimated from CGroupMemoryUsed or
          OSMemoryTotal
        </div>
      </div>
    </ChartCard>
  )
}

export default ChartSummaryUsedByMerges