import CreateSubscriptionModal from '@/components/CreateSubscriptionModal'
import SubscriptionCard from '@/components/SubscriptionCard'
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard'
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from '@/constants/data'
import { icons } from '@/constants/icons'
import images from '@/constants/images'
import '@/global.css'
import { useSubscriptionStore } from '@/lib/subscriptionStore'
import { useUser } from '@clerk/expo'
import dayjs from 'dayjs'
import { styled } from 'nativewind'
import { useState } from 'react'
import { FlatList, Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import ListHeading from '../../components/ListHeading'
import { formatCurrency } from '../../lib/utils'

const SafeAreaView = styled(RNSafeAreaView)

export default function App() {
  const { user } = useUser()
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    'User'

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { subscriptions, addSubscription } = useSubscriptionStore()

  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id
    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id,
    )
  }

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription)
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                {/* <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text> */}

                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
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
