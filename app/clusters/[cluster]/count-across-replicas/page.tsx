import { ColumnFormat } from '@/components/data-table/column-defs'
import { DataTable } from '@/components/data-table/data-table'
import { fetchData } from '@/lib/clickhouse'

import type { QueryConfig } from '@/lib/types/query-config'

interface PageProps {
  params: {
    cluster: string
  }
}

export default async function Page({ params: { cluster } }: PageProps) {
  const replicas = await fetchData<{ replica: string }[]>({
    query: `SELECT hostName() as replica FROM clusterAllReplicas({cluster: String}) ORDER BY 1`,
    query_params: { cluster },
  })
  console.log('Replicas', replicas)

  if (replicas.length === 0) {
    return <div>No replicas found in cluster: {cluster}</div>
  }

  const query = `
    SELECT
      format('{}.{}', database, table) as table,
      ${replicas.map(({ replica }) => `sumIf(rows, active AND hostName() = '${replica}') as \`${replica}\``).join(', ')},
      ${replicas.map(({ replica }) => `formatReadableQuantity(\`${replica}\`) as \`readable_${replica}\``).join(', ')},
      ${replicas.map(({ replica }) => `(100 * \`${replica}\` / max(\`${replica}\`) OVER ()) as \`pct_${replica}\``).join(', ')}
    FROM clusterAllReplicas({cluster: String}, system.parts)
    WHERE database NOT IN ('system')
    GROUP BY 1
    ORDER BY 2 DESC
  `

  const config: QueryConfig = {
    name: 'rows-across-replicas',
    description: 'Part total rows across replicas',
    sql: query,
    columns: ['table', ...replicas.map(({ replica }) => `readable_${replica}`)],
    columnFormats: {
      ...replicas
        .map(({ replica }) => ({
          [`readable_${replica}`]: ColumnFormat.BackgroundBar,
        }))
        .reduce((acc, val) => ({ ...acc, ...val }), {}),
    },
  }

  const rows = await fetchData<
    {
      table: string
      [replica: string]: string | number
    }[]
  >({
    query: config.sql,
    query_params: { cluster },
  })

  return (
    <DataTable
      title={`Total rows of active parts across replicas in the '${cluster}' cluster`}
      config={config}
      data={rows}
    />
  )
}
