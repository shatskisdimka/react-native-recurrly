import SubscriptionCard from '@/components/SubscriptionCard'
import { useSubscriptions } from '@/lib/useSubscriptions'
import { styled } from 'nativewind'
import { useState } from 'react'
import { FlatList, Text, TextInput, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = styled(RNSafeAreaView)

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { subscriptions, update, cancel } = useSubscriptions()

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUpdate = async (
    id: string,
    updates: Pick<Subscription, 'paymentMethod' | 'startDate' | 'renewalDate'>,
  ) => {
    try {
      await update(id, updates)
    } catch (e) {
      console.error('Failed to update subscription:', e)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancel(id)
      if (expandedId === id) setExpandedId(null)
    } catch (e) {
      console.error('Failed to cancel subscription:', e)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-5 pt-5">
            <Text className="text-3xl font-bold text-primary mb-5">Subscriptions</Text>
            <TextInput
              className="bg-card rounded-xl px-4 py-3 text-dark mb-4"
              placeholder="Search subscriptions..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onCancelPress={() => handleCancel(item.id)}
            onUpdate={(updates) => handleUpdate(item.id, updates)}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center text-dark/60 mt-6">
            {searchQuery.trim() ? 'No subscriptions match your search.' : 'No subscriptions yet.'}
          </Text>
        }
        contentContainerClassName="pb-30 px-5"
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  )
}

export default Subscriptions
