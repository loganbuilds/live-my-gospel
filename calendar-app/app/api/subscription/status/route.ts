import { NextResponse } from 'next/server'
import { getUserSubscription, getSubscriptionStatus } from '@/lib/subscription'

export async function GET() {
  try {
    const subscription = await getUserSubscription()
    const status = getSubscriptionStatus(subscription)

    return NextResponse.json({
      subscription,
      ...status,
    })
  } catch (error: any) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}
