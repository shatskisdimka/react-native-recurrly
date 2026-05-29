import CreateSubscriptionModal from '@/components/CreateSubscriptionModal'
import SubscriptionCard from '@/components/SubscriptionCard'
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard'
import { icons } from '@/constants/icons'
import images from '@/constants/images'
import '@/global.css'
import { useSubscriptions } from '@/lib/useSubscriptions'
import { formatCurrency, getMonthlyPrice } from '@/lib/utils'
import { useUser } from '@clerk/expo'
import dayjs from 'dayjs'
import { styled } from 'nativewind'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import ListHeading from '../../components/ListHeading'

const SafeAreaView = styled(RNSafeAreaView)

const ItemSeparator = () => <View className="h-4" />

export default function App() {
  const { user } = useUser()
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    'User'

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditingId, setIsEditingId] = useState<string | null>(null)

  const { subscriptions, isLoading, create, update, cancel } = useSubscriptions()

  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === 'active')
      .reduce((sum, sub) => sum + getMonthlyPrice(sub), 0)
  }, [subscriptions])

  const nextRenewalDate = useMemo(() => {
    const dates = subscriptions
      .filter((sub) => sub.status === 'active' && sub.renewalDate)
      .map((sub) => sub.renewalDate!)
      .sort()
    return dates[0] ?? null
  }, [subscriptions])

  const upcomingSubscriptions = useMemo<UpcomingSubscription[]>(() => {
    const now = dayjs()
    return subscriptions
      .filter((sub) => {
        if (sub.status !== 'active' || !sub.renewalDate) return false
        const daysLeft = dayjs(sub.renewalDate).diff(now, 'day')
        return daysLeft >= 0 && daysLeft <= 7
      })
      .map((sub) => ({
        id: sub.id,
        icon_url: sub.icon_url,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: dayjs(sub.renewalDate!).diff(now, 'day'),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [subscriptions])

  const handleSubscriptionPress = useCallback((item: Subscription) => {
    setExpandedSubscriptionId((cur) => (cur === item.id ? null : item.id))
  }, [])

  const handleCancel = useCallback(
    async (id: string) => {
      await cancel(id)
      setExpandedSubscriptionId((cur) => (cur === id ? null : cur))
    },
    [cancel],
  )

  const listHeader = useMemo(
    () => (
      <>
        <View className="home-header">
          <View className="home-user">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="home-avatar"
            />
            <Text className="home-user-name" numberOfLines={1} ellipsizeMode="tail">
              {displayName}
            </Text>
          </View>
          <Pressable onPress={() => setIsModalVisible(true)}>
            <Image source={icons.add} className="home-add-icon" />
          </Pressable>
        </View>

        <View className="home-balance-card">
          <Text className="home-balance-label">Monthly spend</Text>
          <View className="home-balance-row">
            <Text className="home-balance-amount">{formatCurrency(totalMonthly)}</Text>
            <Text className="home-balance-date">
              {nextRenewalDate ? dayjs(nextRenewalDate).format('MM/DD') : '—'}
            </Text>
          </View>
        </View>

        <View className="mb-5">
          <ListHeading title="Upcoming" />
          <FlatList
            data={upcomingSubscriptions}
            renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
            keyExtractor={(item) => item.id}
            horizontal
            ListEmptyComponent={
              <Text className="home-empty-state">No upcoming renewals yet.</Text>
            }
          />
        </View>

        <ListHeading title="All Subscriptions" />
      </>
    ),
    [user, displayName, totalMonthly, nextRenewalDate, upcomingSubscriptions],
  )

  const renderItem = useCallback(
    ({ item }: { item: Subscription }) => (
      <SubscriptionCard
        {...item}
        expanded={expandedSubscriptionId === item.id}
        onPress={() => handleSubscriptionPress(item)}
        onCancelPress={() => handleCancel(item.id)}
        onUpdate={(updates) => update(item.id, updates)}
        onEditingChange={(editing) => setIsEditingId(editing ? item.id : null)}
      />
    ),
    [expandedSubscriptionId, handleSubscriptionPress, handleCancel],
  )

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={listHeader}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-6" />
          ) : (
            <Text className="home-empty-state">No subscriptions yet.</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: isEditingId ? 400 : 120 }}
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={create}
      />
    </SafeAreaView>
  )
}
