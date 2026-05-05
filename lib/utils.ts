import dayjs from 'dayjs'

export function formatCurrency(
  value: number,
  currency: string = 'USD',
): string {
  try {
    if (typeof value !== 'number') {
      throw new Error('Value must be a number')
    }
    const formatted = value.toFixed(2)
    const symbol = currency === 'USD' ? '$' : '€'
    return `${symbol}${formatted}`
  } catch (error) {
    const msg = (error as any).message ?? 'Unknown error'
    console.error('Currency formatting error:', msg)
    return `Error: ${msg}`
  }
}
export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return 'Not provided'
  const parsedDate = dayjs(value)
  return parsedDate.isValid() ? parsedDate.format('MM/DD/YYYY') : 'Not provided'
}

export const formatStatusLabel = (value?: string): string => {
  if (!value) return 'Unknown'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
