import { ChartCard } from '@/components/chart-card'
import { fetchData } from '@/lib/clickhouse'
import { cn } from '@/lib/utils'
import { BarChart } from '../tremor/bar'
import { type ChartProps } from './chart-props'

export async function ChartConnectionsHttp({
  title = 'HTTP Connections Last 7 days (Total Requests / Hour)',
  interval = 'toStartOfHour',
  lastHours = 24 * 7,
  className,
  chartClassName,
}: ChartProps) {
  const query = `
    /* HTTPConnection: Number of connections to HTTP server */
    /* HTTPConnectionsTotal: Total count of all sessions: stored in the pool and actively used right now for http hosts */

    SELECT
      ${interval}(event_time) AS event_time,
      SUM(CurrentMetric_HTTPConnection) AS CurrentMetric_HTTPConnection,
      formatReadableQuantity(CurrentMetric_HTTPConnection) AS readable_CurrentMetric_HTTPConnection,
      SUM(CurrentMetric_HTTPConnectionsTotal) AS CurrentMetric_HTTPConnectionsTotal,
      formatReadableQuantity(CurrentMetric_HTTPConnectionsTotal) AS readable_CurrentMetric_HTTPConnectionsTotal
    FROM system.metric_log
    WHERE event_time >= now() - INTERVAL ${lastHours} HOUR
    GROUP BY event_time
    ORDER BY event_time
  `

  const { data } = await fetchData<
    {
      event_time: string
      CurrentMetric_HTTPConnection: number
      readable_CurrentMetric_HTTPConnection: string
      CurrentMetric_HTTPConnectionsTotal: number
      readable_CurrentMetric_HTTPConnectionsTotal: string
    }[]
  >({
    query,
    format: 'JSONEachRow',
  })

  return (
    <ChartCard title={title} sql={query} className={className}>
      <BarChart
        data={data}
        index="event_time"
        categories={[
          'CurrentMetric_HTTPConnectionsTotal',
          'CurrentMetric_HTTPConnection',
        ]}
        className={cn('h-52', chartClassName)}
        stack
      />
    </ChartCard>
  )
}

export default ChartConnectionsHttp
