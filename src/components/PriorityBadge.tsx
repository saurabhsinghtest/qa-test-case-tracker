import type { Priority } from '../types/testCase'
import { prioritySlug } from '../utils/format'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge badge--priority badge--priority-${prioritySlug(priority)}`}>
      {priority}
    </span>
  )
}
