import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export async function getUserSubscription(): Promise<Subscription | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

export async function hasActiveSubscription(): Promise<boolean> {
  const subscription = await getUserSubscription()

  if (!subscription) {
    return false
  }

  // Check if subscription is active or in trial
  const activeStatuses = ['active', 'trialing']
  return activeStatuses.includes(subscription.status)
}

export async function isSubscriptionExpired(): Promise<boolean> {
  const subscription = await getUserSubscription()

  if (!subscription || !subscription.current_period_end) {
    return true
  }

  const endDate = new Date(subscription.current_period_end)
  return endDate < new Date()
}

export function getSubscriptionStatus(subscription: Subscription | null): {
  hasAccess: boolean
  status: SubscriptionStatus
  message: string
} {
  if (!subscription) {
    return {
      hasAccess: false,
      status: null,
      message: 'No subscription found. Start your free trial today!',
    }
  }

  const activeStatuses = ['active', 'trialing']
  const hasAccess = activeStatuses.includes(subscription.status)

  let message = ''
  switch (subscription.status) {
    case 'active':
      message = 'Your subscription is active'
      break
    case 'trialing':
      message = 'You are on a free trial'
      break
    case 'past_due':
      message = 'Your payment is past due. Please update your payment method.'
      break
    case 'canceled':
      message = 'Your subscription has been canceled'
      break
    default:
      message = 'Please subscribe to continue using the app'
  }

  return {
    hasAccess,
    status: subscription.status as SubscriptionStatus,
    message,
  }
}
