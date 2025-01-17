import { ChartCard } from '@/components/chart-card'
import { type ChartProps } from '@/components/charts/chart-props'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchData } from '@/lib/clickhouse'
import { cn } from '@/lib/utils'

export async function ChartReplicationSummaryTable({
  title,
  className,
}: ChartProps) {
  const query = `
    SELECT (database || '.' || table) as table,
           type,
           countIf(is_currently_executing) AS current_executing,
           COUNT() as total
    FROM system.replication_queue
    GROUP BY 1, 2
  `
  const data = await fetchData<
    {
      table: string
      type: string
      current_executing: number
      total: number
    }[]
  >({ query })

  const headers = Object.keys(data?.[0] || {})

  return (
    <ChartCard
      title={title}
      className={cn('justify-between', className)}
      sql={query}
    >
      <div className="flex flex-col justify-between p-0">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {Object.values(row).map((value, i) => {
                  return <TableCell key={i}>{value || ''} </TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  )
}

export default ChartReplicationSummaryTable
