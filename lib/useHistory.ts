import { clearHistory, fetchHistory } from '@/lib/api'
import { useAuth } from '@clerk/expo'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const HISTORY_KEY = ['history'] as const

export function useHistory() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: HISTORY_KEY,
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return fetchHistory(token)
    },
    enabled: false,
    staleTime: 30_000,
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return clearHistory(token)
    },
    onSuccess: () => queryClient.setQueryData(HISTORY_KEY, []),
  })

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    clear: clearMutation.mutateAsync,
    isClearing: clearMutation.isPending,
  }
}
