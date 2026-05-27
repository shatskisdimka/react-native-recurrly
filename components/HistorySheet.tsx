import { useHistory } from '@/lib/useHistory'
import { formatBillingPeriod, formatCurrency } from '@/lib/utils'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { styled } from 'nativewind'
import { useEffect, useRef } from 'react'
import { Alert, Image, Modal, PanResponder, Pressable, ScrollView, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

const AnimatedSheet = styled(Animated.View)

interface HistorySheetProps {
  visible: boolean
  onClose: () => void
}

const SPRING = { damping: 22, stiffness: 220 } as const
const CLOSE_DURATION = 280

export default function HistorySheet({ visible, onClose }: HistorySheetProps) {
  const translateY = useSharedValue(600)
  const { history, isLoading, refetch, clear, isClearing } = useHistory()

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (visible) {
      translateY.value = 600
      translateY.value = withSpring(0, SPRING)
      refetch()
    }
  }, [visible])

  const animateClose = () => {
    translateY.value = withTiming(600, { duration: CLOSE_DURATION })
    setTimeout(() => onCloseRef.current(), CLOSE_DURATION)
  }

  const animateCloseRef = useRef(animateClose)
  animateCloseRef.current = animateClose

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && g.dy > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.value = g.dy
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          animateCloseRef.current()
        } else {
          translateY.value = withSpring(0, SPRING)
        }
      },
    }),
  ).current

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const handleClear = () => {
    Alert.alert('Clear History', 'Are you sure you want to remove all cancelled subscriptions?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, clear it', style: 'destructive', onPress: () => clear().catch(console.error) },
    ])
  }

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={animateClose}>
      <View className="flex-1 justify-end">
        {/* Tap-to-close backdrop, sits behind the sheet */}
        <Pressable className="absolute inset-0" onPress={animateClose} />

        {/* Sheet — style prop only for the Reanimated translateY */}
        <AnimatedSheet
          className="rounded-t-3xl bg-background overflow-hidden max-h-[80%]"
          style={sheetStyle}
        >
          {/* Drag zone: handle bar + header trigger swipe-to-dismiss */}
          <View {...panResponder.panHandlers}>
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-black/15" />
            </View>

            <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
              <Text className="text-xl font-sans-bold text-primary">Cancelled</Text>
              <Pressable onPress={handleClear} disabled={isClearing || history.length === 0}>
                <Text
                  className={clsx(
                    'text-sm font-sans-semibold',
                    history.length === 0 || isClearing ? 'text-black/35' : 'text-destructive',
                  )}
                >
                  {isClearing ? 'Clearing…' : 'Clear All'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* List scrolls independently from the dismiss gesture */}
          <ScrollView
            contentContainerClassName="p-5 gap-3"
            showsVerticalScrollIndicator={false}
          >
            {isLoading && (
              <Text className="text-center font-sans-medium text-sm text-muted-foreground py-8">
                Loading…
              </Text>
            )}

            {!isLoading && history.length === 0 && (
              <Text className="text-center font-sans-medium text-sm text-muted-foreground py-8">
                No cancelled subscriptions.
              </Text>
            )}

            {history.map((sub) => (
              <View
                key={sub.id}
                className="flex-row items-center gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: sub.color || '#f6eecf' }}
              >
                <Image
                  source={sub.icon_url ? { uri: sub.icon_url } : undefined}
                  className="w-12 h-12 rounded-lg bg-white/30"
                />
                <View className="flex-1 min-w-0">
                  <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
                    {sub.name}
                  </Text>
                  <Text className="text-xs font-sans-medium text-primary/60 mt-1">
                    {sub.renewalDate
                      ? `Renewed ${dayjs(sub.renewalDate).format('MMM D, YYYY')}`
                      : 'No date'}
                  </Text>
                </View>
                <View className="items-end shrink-0">
                  <Text className="text-base font-sans-bold text-primary">
                    {formatCurrency(sub.price, sub.currency)}
                  </Text>
                  <Text className="text-xs font-sans-medium text-primary/60 mt-1">
                    {formatBillingPeriod(sub.billing)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </AnimatedSheet>
      </View>
    </Modal>
  )
}
