import { create } from 'zustand'

interface SubscriptionStore {
  subscriptions: Subscription[]
  addSubscription: (subscription: Subscription) => void
  setSubscriptions: (subscriptions: Subscription[]) => void
  removeSubscription: (id: string) => void
  updateSubscription: (id: string, updates: Partial<Subscription>) => void
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: [],
  addSubscription: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
  updateSubscription: (id, updates) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub,
      ),
    })),
}))
