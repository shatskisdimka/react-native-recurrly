import { useHistory } from '@/lib/useHistory'
import { formatCurrency } from '@/lib/utils'
import dayjs from 'dayjs'
import { useEffect, useRef } from 'react'
import {
  Alert,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

interface HistorySheetProps {
  visible: boolean
  onClose: () => void
}

const SPRING = { damping: 22, stiffness: 220 } as const

export default function HistorySheet({ visible, onClose }: HistorySheetProps) {
  const translateY = useSharedValue(600)
  const { history, isLoading, refetch, clear, isClearing } = useHistory()

  // Ref чтобы PanResponder всегда видел актуальный onClose
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (visible) {
      translateY.value = 600
      translateY.value = withSpring(0, SPRING)
      refetch()
    }
  }, [visible])

  const CLOSE_DURATION = 280
  const animateClose = () => {
    translateY.value = withTiming(600, { duration: CLOSE_DURATION })
    setTimeout(() => onCloseRef.current(), CLOSE_DURATION)
  }

  // Ref чтобы PanResponder не пересоздавался на каждый рендер
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
    Alert.alert('Очистить историю', 'Удалить все отменённые подписки навсегда?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: () => clear().catch(console.error) },
    ])
  }

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={animateClose}>
      <View style={styles.root}>
        {/* Backdrop — за шторой, тап закрывает */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={animateClose} />

        {/* Шторка */}
        <Animated.View style={[sheetStyle, styles.sheet]}>
          {/* Только эта зона реагирует на свайп вниз */}
          <View {...panResponder.panHandlers}>
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>Cancelled</Text>
              <Pressable onPress={handleClear} disabled={isClearing || history.length === 0}>
                <Text
                  style={[
                    styles.clearBtn,
                    (history.length === 0 || isClearing) && styles.clearBtnDisabled,
                  ]}
                >
                  {isClearing ? 'Clearing…' : 'Clear All'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Список скроллится независимо от жеста закрытия */}
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && <Text style={styles.emptyText}>Loading…</Text>}

            {!isLoading && history.length === 0 && (
              <Text style={styles.emptyText}>No cancelled subscriptions.</Text>
            )}

            {history.map((sub) => (
              <View key={sub.id} style={styles.row}>
                <Image
                  source={sub.icon_url ? { uri: sub.icon_url } : undefined}
                  style={styles.icon}
                />
                <View style={styles.rowBody}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {sub.name}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {sub.renewalDate
                      ? `Renewed ${dayjs(sub.renewalDate).format('MMM D, YYYY')}`
                      : 'No date'}
                  </Text>
                </View>
                <View style={styles.rowEnd}>
                  <Text style={styles.rowPrice}>{formatCurrency(sub.price, sub.currency)}</Text>
                  <Text style={styles.rowMeta}>per {sub.billing?.toLowerCase() || 'month'}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    backgroundColor: '#fff9e3',
    overflow: 'hidden',
  },
  handleRow: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.15)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  title: { fontSize: 20, fontFamily: 'sans-bold', color: '#081126' },
  clearBtn: { fontSize: 14, fontFamily: 'sans-semibold', color: '#dc2626' },
  clearBtnDisabled: { color: 'rgba(0,0,0,0.35)' },
  list: { padding: 20, gap: 12 },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(0,0,0,0.45)',
    fontFamily: 'sans-medium',
    fontSize: 14,
    paddingVertical: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f6eecf',
  },
  icon: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)' },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 16, fontFamily: 'sans-bold', color: '#081126' },
  rowMeta: { fontSize: 12, fontFamily: 'sans-medium', color: 'rgba(0,0,0,0.5)', marginTop: 4 },
  rowEnd: { alignItems: 'flex-end', flexShrink: 0 },
  rowPrice: { fontSize: 16, fontFamily: 'sans-bold', color: '#081126' },
})
