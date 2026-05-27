import HistorySheet from '@/components/HistorySheet'
import ListHeading from '@/components/ListHeading'
import { useSubscriptions } from '@/lib/useSubscriptions'
import { formatBillingPeriod, formatCurrency, getMonthlyPrice } from '@/lib/utils'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { styled } from 'nativewind'
import { useMemo, useState } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = styled(RNSafeAreaView)

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const Insights = () => {
  const { subscriptions } = useSubscriptions()
  const [historyVisible, setHistoryVisible] = useState(false)

  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === 'active')
      .reduce((sum, sub) => sum + getMonthlyPrice(sub), 0)
  }, [subscriptions])

  const chartData = useMemo(() => {
    const data = DAYS.map((day) => ({ day, amount: 0 }))

    subscriptions.forEach((sub) => {
      const dateStr = sub.renewalDate || sub.startDate
      if (!dateStr) return

      const dayOfWeek = dayjs(dateStr).day()
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

      data[dayIndex].amount += getMonthlyPrice(sub)
    })

    const today = dayjs().day()
    const todayIndex = today === 0 ? 6 : today - 1

    return data.map((d, i) => ({ ...d, isToday: i === todayIndex }))
  }, [subscriptions])

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1)
  const gridMax = Math.ceil(maxAmount / 10) * 10
  const gridValues = [gridMax, Math.round(gridMax * 0.66), Math.round(gridMax * 0.33)]
  const todayBar = chartData.find((d) => d.isToday && d.amount > 0)

  const history = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const dateA = a.renewalDate || a.startDate || ''
      const dateB = b.renewalDate || b.startDate || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dayjs(dateA).diff(dayjs(dateB))
    })
  }, [subscriptions])

  const currentMonth = dayjs().format('MMMM YYYY')

  const activeCount = subscriptions.filter((sub) => sub.status === 'active').length

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      >
        <View className="items-center pt-5 pb-2">
          <Text className="text-3xl font-sans-bold text-dark mb-0">Monthly Insights</Text>
        </View>

        <View className="px-5 mt-4">
          <ListHeading title="Upcoming" />

          <View className="bg-muted rounded-3xl p-5 mt-2 h-64 relative overflow-hidden">
            {todayBar && (
              <View className="absolute top-3 right-4 bg-background rounded-lg px-2 py-1 border border-border">
                <Text className="text-[10px] font-sans-bold text-accent">
                  {formatCurrency(todayBar.amount)}
                </Text>
              </View>
            )}

            <View className="absolute left-5 right-5 top-5 bottom-12 justify-between pointer-events-none">
              {gridValues.map((val) => (
                <View key={val} className="flex-row items-center">
                  <Text className="text-[10px] font-sans-medium text-muted-foreground w-10">
                    ${val}
                  </Text>
                  <View className="flex-1 h-px bg-border/60" />
                </View>
              ))}
            </View>

            <View className="flex-row items-end justify-between h-full pb-6 pl-11">
              {chartData.map((item) => {
                const heightPercent = (item.amount / gridMax) * 62
                const isHighlighted = item.isToday

                return (
                  <View key={item.day} className="flex-1 items-center justify-end">
                    <View
                      className={clsx(
                        'w-3.5 rounded-full',
                        isHighlighted ? 'bg-accent' : 'bg-primary',
                      )}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                    <Text
                      className={clsx(
                        'text-xs mt-2 font-sans-medium',
                        isHighlighted ? 'text-accent' : 'text-muted-foreground',
                      )}
                    >
                      {item.day}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        <View className="px-5 mt-5">
          <View className="auth-card flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-sans-bold text-primary">Expenses</Text>
              <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                {currentMonth}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-sans-bold text-primary">
                -{formatCurrency(totalMonthly)}
              </Text>
              <Text className="text-sm font-sans-semibold text-accent mt-1">
                {activeCount} active
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-6">
          <ListHeading title="History" onViewAll={() => setHistoryVisible(true)} />

          <View className="mt-2 gap-3">
            {history.map((sub) => (
              <View
                key={sub.id}
                className="rounded-2xl p-4 flex-row items-center justify-between"
                style={{ backgroundColor: sub.color || '#f6eecf' }}
              >
                <View className="flex-row items-center gap-3 min-w-0 flex-1">
                  <Image
                    source={sub.icon_url ? { uri: sub.icon_url } : undefined}
                    className="size-12 rounded-lg bg-background/20"
                  />
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <Text className="text-xs font-sans-medium text-primary/70 mt-1">
                      {sub.renewalDate
                        ? dayjs(sub.renewalDate).format('MMMM D, HH:mm')
                        : 'No date'}
                    </Text>
                  </View>
                </View>
                <View className="items-end ml-3 shrink-0">
                  <Text className="text-base font-sans-bold text-primary">
                    {formatCurrency(sub.price, sub.currency)}
                  </Text>
                  <Text className="text-xs font-sans-medium text-primary/70 mt-1">
                    {formatBillingPeriod(sub.billing)}
                  </Text>
                </View>
              </View>
            ))}

            {history.length === 0 && (
              <Text className="home-empty-state text-center">No subscription history yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <HistorySheet visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </SafeAreaView>
  )
}

export default Insights
