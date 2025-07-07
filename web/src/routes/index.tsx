import { createFileRoute } from '@tanstack/react-router'
import LumenLogs from '@/components/LumenLogs'

export const Route = createFileRoute('/')({
  component: LumenLogs,
})
