import SubscriptionIcon from '@/components/SubscriptionIcon'
import { formatCurrency } from '@/lib/utils'
import React from 'react'
import { Text, View } from 'react-native'

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon_url,
  currency,
}: UpcomingSubscription) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <SubscriptionIcon icon_url={icon_url} name={name} className="upcoming-icon" textClassName="text-2xl font-sans-bold text-primary/50" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : 'Last day'}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name">{name}</Text>
    </View>
  )
}

export default UpcomingSubscriptionCard
