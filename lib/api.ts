import { supabase } from '@/lib/supabase'

// get sub from current user
export const fetchSubscriptions = async (clerkToken: string): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    currency: item.currency,
    billing: item.billing,
    category: item.category,
    status: item.status,
    startDate: item.start_date,
    renewalDate: item.renewal_date,
    color: item.color,
    icon_url: item.icon_url,
    plan: item.plan,
    paymentMethod: item.payment_method,
    frequency: item.frequency,
  }))
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

// delete sub
export const deleteSubscription = async (clerkToken: string, id: string) => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .setHeader('Authorization', `Bearer ${clerkToken}`)

  if (error) throw error
}
