import { HOME_SUBSCRIPTIONS } from '@/constants/data'
import { create } from 'zustand'

interface SubscriptionStore {
  subscriptions: Subscription[]
  addSubscription: (subscription: Subscription) => void
  setSubscriptions: (subscriptions: Subscription[]) => void
  removeSubscription: (id: string) => void
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
}))
