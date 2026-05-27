import { cancelSubscription, createSubscription, fetchSubscriptions, updateSubscription } from '@/lib/api'
import { useAuth, useUser } from '@clerk/expo'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

export const SUBSCRIPTIONS_KEY = ['subscriptions'] as const

export function useSubscriptions() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      let data = await fetchSubscriptions(token)

      const now = dayjs()
      const renewals = data
        .filter((sub) => sub.status === 'active' && sub.renewalDate && dayjs(sub.renewalDate).isBefore(now))
        .map((sub) => {
          let next = dayjs(sub.renewalDate!)
          const unit = (sub.frequency || sub.billing)?.toLowerCase() === 'yearly' ? 'year' : 'month'
          while (next.isBefore(now)) next = next.add(1, unit as 'year' | 'month')
          return { id: sub.id, renewalDate: next.toISOString() }
        })

      if (renewals.length > 0) {
        await Promise.all(
          renewals.map(({ id, renewalDate }) => updateSubscription(token, id, { renewalDate }))
        )
        data = data.map((sub) => {
          const r = renewals.find((r) => r.id === sub.id)
          return r ? { ...sub, renewalDate: r.renewalDate } : sub
        })
      }

      return data
    },
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: async (newSub: Omit<Subscription, 'id'>) => {
      const token = await getToken()
      if (!token || !user) throw new Error('Not authenticated')
      return createSubscription(token, newSub, user.id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Pick<Subscription, 'paymentMethod' | 'startDate' | 'renewalDate'>
    }) => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return updateSubscription(token, id, updates)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      return cancelSubscription(token, id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY }),
  })

  return {
    subscriptions: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: (id: string, updates: Pick<Subscription, 'paymentMethod' | 'startDate' | 'renewalDate'>) =>
      updateMutation.mutateAsync({ id, updates }),
    cancel: cancelMutation.mutateAsync,
  }
}
