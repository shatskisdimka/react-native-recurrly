import CreateSubscriptionModal from '@/components/CreateSubscriptionModal'
import SubscriptionCard from '@/components/SubscriptionCard'
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard'
import { icons } from '@/constants/icons'
import images from '@/constants/images'
import '@/global.css'
import { createSubscription, deleteSubscription, fetchSubscriptions, updateSubscription } from '@/lib/api'
import { useSubscriptionStore } from '@/lib/subscriptionStore'
import { useAuth, useUser } from '@clerk/expo'
import dayjs from 'dayjs'
import { styled } from 'nativewind'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import ListHeading from '../../components/ListHeading'
import { formatCurrency, getMonthlyPrice } from '../../lib/utils'

const SafeAreaView = styled(RNSafeAreaView)

const ItemSeparator = () => <View className="h-4" />

export default function App() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    'User'

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { subscriptions, addSubscription, removeSubscription, setSubscriptions, updateSubscription: storeUpdate } =
    useSubscriptionStore()

  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === 'active')
      .reduce((sum, sub) => {
        return sum + getMonthlyPrice(sub)
      }, 0)
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

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      if (!token) return
      try {
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

        setSubscriptions(data)
      } catch (e) {
        console.error('Failed to fetch subscriptions:', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSubscriptionPress = useCallback((item: Subscription) => {
    setExpandedSubscriptionId((cur) => cur === item.id ? null : item.id)
  }, [])

  const handleCreateSubscription = useCallback(async (newSubscription: Subscription) => {
    const token = await getToken()
    if (!token || !user) return
    try {
      const saved = await createSubscription(token, newSubscription, user.id)
      addSubscription(saved)
    } catch (e) {
      console.error('Failed to save subscription:', e)
    }
  }, [getToken, user, addSubscription])

  const handleUpdate = useCallback(async (
    id: string,
    updates: Pick<Subscription, 'paymentMethod' | 'startDate' | 'renewalDate'>,
  ) => {
    const token = await getToken()
    if (!token) return
    try {
      await updateSubscription(token, id, updates)
      storeUpdate(id, updates)
    } catch (e) {
      console.error('Failed to update subscription:', e)
    }
  }, [getToken, storeUpdate])

  const handleCancel = useCallback(async (id: string) => {
    const token = await getToken()
    if (!token) return
    try {
      await deleteSubscription(token, id)
      removeSubscription(id)
      setExpandedSubscriptionId((cur) => cur === id ? null : cur)
    } catch (e) {
      console.error('Failed to delete subscription:', e)
    }
  }, [getToken, removeSubscription])

  // Не зависит от expandedSubscriptionId — не перерендерится при раскрытии карточки
  const listHeader = useMemo(() => (
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
  ), [user, displayName, totalMonthly, nextRenewalDate, upcomingSubscriptions])

  const renderItem = useCallback(({ item }: { item: Subscription }) => (
    <SubscriptionCard
      {...item}
      expanded={expandedSubscriptionId === item.id}
      onPress={() => handleSubscriptionPress(item)}
      onCancelPress={() => handleCancel(item.id)}
      onUpdate={(updates) => handleUpdate(item.id, updates)}
    />
  ), [expandedSubscriptionId, handleSubscriptionPress, handleCancel, handleUpdate])

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
          isLoading
            ? <ActivityIndicator className="mt-6" />
            : <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  )
}
