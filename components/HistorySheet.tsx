import { formatCurrency } from '@/lib/utils'
import { useHistory } from '@/lib/useHistory'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface HistorySheetProps {
  visible: boolean
  onClose: () => void
}

export default function HistorySheet({ visible, onClose }: HistorySheetProps) {
  const translateY = useSharedValue(600)
  const { history, isLoading, refetch, clear, isClearing } = useHistory()

  useEffect(() => {
    if (visible) {
      refetch()
      translateY.value = withSpring(0, { damping: 22, stiffness: 220 })
    } else {
      translateY.value = withSpring(600, { damping: 22, stiffness: 220 })
    }
  }, [visible])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const handleClear = () => {
    Alert.alert('Clear History', 'Remove all cancelled subscriptions permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => clear().catch(console.error),
      },
    ])
  }

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Animated.View style={[sheetStyle, { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '80%', backgroundColor: '#fff9e3' }]}>
          <Pressable onStartShouldSetResponder={() => true}>
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>

            <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
              <Text className="text-xl font-sans-bold text-primary">Cancelled</Text>
              <Pressable
                onPress={handleClear}
                disabled={isClearing || history.length === 0}
              >
                <Text
                  className={`text-sm font-sans-semibold ${
                    history.length === 0 || isClearing
                      ? 'text-muted-foreground'
                      : 'text-destructive'
                  }`}
                >
                  {isClearing ? 'Clearing…' : 'Clear All'}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 20, gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {isLoading && (
                <Text className="text-center text-muted-foreground text-sm py-8">
                  Loading…
                </Text>
              )}

              {!isLoading && history.length === 0 && (
                <Text className="text-center text-muted-foreground text-sm py-8">
                  No cancelled subscriptions.
                </Text>
              )}

              {history.map((sub) => (
                <View
                  key={sub.id}
                  className="flex-row items-center gap-3 p-4 rounded-2xl bg-muted"
                >
                  <Image
                    source={sub.icon_url ? { uri: sub.icon_url } : undefined}
                    className="size-12 rounded-lg bg-background/20"
                  />
                  <View className="flex-1 min-w-0">
                    <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                      {sub.renewalDate
                        ? `Renewed ${dayjs(sub.renewalDate).format('MMM D, YYYY')}`
                        : 'No date'}
                    </Text>
                  </View>
                  <View className="items-end shrink-0">
                    <Text className="text-base font-sans-bold text-primary">
                      {formatCurrency(sub.price, sub.currency)}
                    </Text>
                    <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                      per {sub.billing?.toLowerCase() || 'month'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
