import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from '@/lib/utils'
import clsx from 'clsx'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native'

const parseMMDDYYYY = (text: string): dayjs.Dayjs | null => {
  if (text.length !== 10) return null
  const [mm, dd, yyyy] = text.split('/')
  const d = dayjs(`${yyyy}-${mm}-${dd}`)
  return d.isValid() ? d : null
}

const SubscriptionCard = ({
  name,
  price,
  icon_url,
  currency,
  billing,
  color,
  category,
  renewalDate,
  plan,
  expanded,
  onPress,
  onCancelPress,
  paymentMethod,
  startDate,
  status,
  onUpdate,
}: SubscriptionCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draftPayment, setDraftPayment] = useState(paymentMethod || '')
  const [draftStartDate, setDraftStartDate] = useState(
    startDate ? dayjs(startDate).format('MM/DD/YYYY') : '',
  )

  useEffect(() => {
    if (!expanded) {
      setIsEditing(false)
      setDraftPayment(paymentMethod || '')
      setDraftStartDate(startDate ? dayjs(startDate).format('MM/DD/YYYY') : '')
    }
  }, [expanded, paymentMethod, startDate])

  const parsedDate = parseMMDDYYYY(draftStartDate)
  const previewRenewal = parsedDate
    ? (billing?.toLowerCase() === 'yearly'
        ? parsedDate.add(1, 'year')
        : parsedDate.add(1, 'month')
      ).toISOString()
    : null

  const handleDateChange = (text: string) => {
    const isDeleting = text.length < draftStartDate.length
    if (isDeleting) {
      setDraftStartDate(text.endsWith('/') ? text.slice(0, -1) : text)
      return
    }
    const digits = text.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    setDraftStartDate(formatted)
  }

  const handleSave = () => {
    onUpdate?.({
      paymentMethod: draftPayment,
      startDate: parsedDate ? parsedDate.toISOString() : startDate,
      renewalDate: previewRenewal ?? renewalDate,
    })
    setIsEditing(false)
  }

  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon_url ? { uri: icon_url } : undefined} className="sub-icon" />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            {isEditing ? (
              <>
                <View className="sub-row">
                  <View className="sub-row-copy flex-1">
                    <Text className="sub-label">Payment:</Text>
                    <TextInput
                      className="sub-input"
                      value={draftPayment}
                      onChangeText={setDraftPayment}
                      placeholder="e.g. Visa ending 8530"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      numberOfLines={1}
                    />
                  </View>
                </View>

                <View className="sub-row">
                  <View className="sub-row-copy flex-1">
                    <Text className="sub-label">Started:</Text>
                    <TextInput
                      className="sub-input"
                      value={draftStartDate}
                      onChangeText={handleDateChange}
                      placeholder="mm/dd/YYYY"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                </View>

                {previewRenewal && (
                  <View className="sub-row">
                    <View className="sub-row-copy">
                      <Text className="sub-label">Renewal date:</Text>
                      <Text className="sub-value">
                        {formatSubscriptionDateTime(previewRenewal)}
                      </Text>
                    </View>
                  </View>
                )}

                <View className="flex-row gap-3 mt-1">
                  <Pressable
                    className="sub-cancel flex-1"
                    onPress={() => setIsEditing(false)}
                  >
                    <Text className="sub-cancel-text">Discard</Text>
                  </Pressable>
                  <Pressable className="sub-cancel flex-1" onPress={handleSave}>
                    <Text className="sub-cancel-text">Save</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">Payment:</Text>
                    <Text
                      className="sub-value"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {paymentMethod?.trim()}
                    </Text>
                  </View>
                </View>

                <View className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">Category:</Text>
                    <Text
                      className="sub-value"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {category?.trim() || plan?.trim()}
                    </Text>
                  </View>
                </View>

                <View className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">Started:</Text>
                    <Text
                      className="sub-value"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {startDate ? formatSubscriptionDateTime(startDate) : ''}
                    </Text>
                  </View>
                </View>

                <View className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">Renewal date:</Text>
                    <Text
                      className="sub-value"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {renewalDate ? formatSubscriptionDateTime(renewalDate) : ''}
                    </Text>
                  </View>
                </View>

                <View className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">Status:</Text>
                    <Text
                      className="sub-value"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {status ? formatStatusLabel(status) : ''}
                    </Text>
                  </View>
                </View>

                <View className="sub-actions">
                  <Pressable className="sub-edit" onPress={() => setIsEditing(true)}>
                    <Text className="sub-edit-text">Edit</Text>
                  </Pressable>

                  {onCancelPress && status !== 'cancelled' && (
                    <Pressable
                      className="sub-cancel"
                      onPress={() =>
                        Alert.alert(
                          'Cancel Subscription',
                          `Are you sure you want to cancel ${name}?`,
                          [
                            { text: 'No', style: 'cancel' },
                            { text: 'Yes, cancel it', style: 'destructive', onPress: onCancelPress },
                          ],
                        )
                      }
                    >
                      <Text className="sub-cancel-text">Cancel Subscription</Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </Pressable>
  )
}

export default SubscriptionCard
