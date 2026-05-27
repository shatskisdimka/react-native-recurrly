import { Image, Text, View } from 'react-native'

interface SubscriptionIconProps {
  icon_url?: string
  name: string
  className?: string
  textClassName?: string
}

const SubscriptionIcon = ({
  icon_url,
  name,
  className = 'w-12 h-12 rounded-lg',
  textClassName = 'text-xl font-sans-bold text-primary/50',
}: SubscriptionIconProps) => {
  if (icon_url) {
    return <Image source={{ uri: icon_url }} className={className} />
  }
  return (
    <View className={`${className} bg-black/10 items-center justify-center`}>
      <Text className={textClassName}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  )
}

export default SubscriptionIcon
