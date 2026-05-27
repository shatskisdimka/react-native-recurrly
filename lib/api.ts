import { supabase } from '@/lib/supabase'

const mapRow = (item: Record<string, unknown>): Subscription => ({
  id: item.id as string,
  name: item.name as string,
  price: item.price as number,
  currency: item.currency as string | undefined,
  billing: item.billing as string,
  category: item.category as string | undefined,
  status: item.status as string | undefined,
  startDate: item.start_date as string | undefined,
  renewalDate: item.renewal_date as string | undefined,
  color: item.color as string | undefined,
  icon_url: item.icon_url as string | undefined,
  plan: item.plan as string | undefined,
  paymentMethod: item.payment_method as string | undefined,
  frequency: item.frequency as string | undefined,
})

export const fetchSubscriptions = async (clerkToken: string): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export const fetchHistory = async (clerkToken: string): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export const clearHistory = async (clerkToken: string): Promise<void> => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('status', 'cancelled')
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error
}

// create sub
export const createSubscription = async (
  clerkToken: string,
  subscription: Omit<Subscription, 'id'>,
  userId: string,
): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{
      user_id: userId,
      name: subscription.name,
      price: subscription.price,
      currency: subscription.currency,
      billing: subscription.billing,
      frequency: subscription.frequency,
      category: subscription.category,
      status: subscription.status,
      start_date: subscription.startDate,
      renewal_date: subscription.renewalDate,
      color: subscription.color,
      icon_url: subscription.icon_url,
      plan: subscription.plan,
      payment_method: subscription.paymentMethod,
    }])
    .setHeader('Authorization', `Bearer ${clerkToken}`)
    .select()
    .single()

  if (error) throw error
  return { ...subscription, id: data.id }
}

// update sub
export const updateSubscription = async (
  clerkToken: string,
  id: string,
  updates: Pick<Subscription, 'paymentMethod' | 'startDate' | 'renewalDate'>,
) => {
  const patch: Record<string, unknown> = {}
  if (updates.paymentMethod !== undefined) patch.payment_method = updates.paymentMethod
  if (updates.startDate !== undefined) patch.start_date = updates.startDate
  if (updates.renewalDate !== undefined) patch.renewal_date = updates.renewalDate

  const { error } = await supabase
    .from('subscriptions')
    .update(patch)
    .eq('id', id)
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error
}

export const cancelSubscription = async (clerkToken: string, id: string): Promise<void> => {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error
}
