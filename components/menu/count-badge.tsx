import { Badge, type BadgeProps } from '@/components/ui/badge'
import { fetchData } from '@/lib/clickhouse'

export interface CountBadgeProps {
  sql?: string
  className?: string
  variant?: BadgeProps['variant']
}

export async function CountBadge({
  sql,
  className,
  variant = 'outline',
}: CountBadgeProps): Promise<JSX.Element | null> {
  if (!sql) return null

  let data: any[] = []

  try {
    data = await fetchData<{ 'count()': string }[]>({
      query: sql,
      format: 'JSONEachRow',
      clickhouse_settings: { use_query_cache: 1, query_cache_ttl: 60 },
    })
  } catch (e: any) {
    console.error(`Could not get count for sql: ${sql}, error: ${e}`)
    return null
  }

  if (!data || !data.length || !data?.[0]?.['count()']) return null

  const count = data[0]['count()'] || data[0]['count'] || 0
  if (count == 0) return null

  return (
    <Badge className={className} variant={variant}>
      {count}
    </Badge>
  )
}
