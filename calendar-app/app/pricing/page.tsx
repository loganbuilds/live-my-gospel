'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleCheckout = async (priceId: string, isTrial: boolean) => {
    setLoading(priceId)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Call API to create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-black p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Start with a free trial, then continue with our affordable plan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Trial Card */}
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 relative">
            <div className="absolute top-4 right-4">
              <span className="bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Free Trial</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="text-gray-400 ml-2">for 7 days</span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Full access to calendar features</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Event management & scheduling</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Weekly key indicators</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">No credit card required</span>
              </li>
            </ul>

            <button
              onClick={() =>
                handleCheckout(process.env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID!, true)
              }
              disabled={loading === process.env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID
                ? 'Loading...'
                : 'Start Free Trial'}
            </button>
          </div>

          {/* Monthly Plan Card */}
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">$9.99</span>
              <span className="text-gray-400 ml-2">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Everything in Free Trial</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Unlimited events</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Data sync across devices</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-6 h-6 text-pink-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-300">Priority support</span>
              </li>
            </ul>

            <button
              onClick={() =>
                handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!, false)
              }
              disabled={loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-colors"
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
                ? 'Loading...'
                : 'Subscribe Now'}
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}
