import { ColumnFormat } from '@/components/data-table/column-defs'
import { type QueryConfig } from '@/lib/types/query-config'

export const distributedDdlQueueConfig: QueryConfig = {
  name: 'distributed-ddl-queue',
  description:
    'Distributed ddl queries (ON CLUSTER clause) that were executed on a cluster',
  sql: `
      SELECT
        entry,
        status,
        entry_version,
        format('{}:{}', initiator_host, toString(initiator_port)) AS initiator,
        cluster,
        query,
        toString(settings) AS settings,
        format('{}:{}', host, toString(port)) AS host,
        exception_code,
        exception_text,
        query_finish_time,
        query_duration_ms
      FROM system.distributed_ddl_queue
      ORDER BY entry DESC, host
      LIMIT 10_000
    `,
  columns: [
    'entry',
    'status',
    'entry_version',
    'initiator',
    'cluster',
    'query',
    'settings',
    'host',
    'exception_code',
    'exception_text',
    'query_finish_time',
    'query_duration_ms',
  ],
  columnFormats: {
    status: ColumnFormat.ColoredBadge,
    query: ColumnFormat.CodeToggle,
    settings: ColumnFormat.CodeToggle,
  },
}
