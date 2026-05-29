import type { ImageSourcePropType } from 'react-native'

declare global {
  interface AppTab {
    name: string
    title: string
    icon: ImageSourcePropType
  }

  interface TabIconProps {
    focused: boolean
    icon: ImageSourcePropType
  }

  interface UpcomingSubscription {
    id: string
    icon_url?: string
    name: string
    price: number
    currency?: string
    daysLeft: number
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    'id'
  > {}

  interface Subscription {
    id: string
    icon_url?: string
    name: string
    plan?: string
    category?: string
    paymentMethod?: string
    status?: string
    startDate?: string
    price: number
    currency?: string
    billing: string
    frequency?: string
    renewalDate?: string
    color?: string
  }

  interface SubscriptionCardProps extends Subscription {
    expanded: boolean
    onPress: () => void
    onCancelPress?: () => void
    isCancelling?: boolean
    onUpdate?: (updates: Pick<Subscription, 'paymentMethod' | 'startDate' | 'renewalDate'>) => void
    onEditingChange?: (isEditing: boolean) => void
  }

  interface ListHeadingProps {
    title: string
    onViewAll?: () => void
  }
}

export { }

