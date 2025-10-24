# Setup Guide: Supabase Auth + Stripe Payments

This guide walks you through completing the setup of authentication and payments for Live My Gospel.

## 📋 Prerequisites Checklist

- [x] Supabase account created
- [x] Stripe account created
- [x] Dependencies installed
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Stripe webhooks configured

---

## STEP 1: Configure Environment Variables

Open `calendar-app/.env.local` and fill in all the values:

### Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **missionary-planner**
3. Go to **Settings** → **API**
4. Copy the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ⚠️ Keep this secret! Used for webhooks
```

### Stripe Credentials

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Go to **Developers** → **API Keys**
4. Copy the keys:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_SECRET_KEY=sk_test_xxx...  # ⚠️ Keep this secret!
```

### Stripe Price IDs

1. Go to **Products** in Stripe Dashboard
2. Click on your **Free Trial** product
3. Copy the **Price ID** (starts with `price_xxx`)
4. Repeat for your **Monthly Pro** product

```env
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxx...
NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID=price_xxx...
```

### Webhook Secret (We'll get this in Step 3)

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx...  # We'll fill this in Step 3
```

---

## STEP 2: Create Database Schema in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (in left sidebar)
4. Click **New Query**
5. Copy the contents of `calendar-app/supabase/migrations/001_create_subscriptions.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: ✅ **Success. No rows returned**

### Verify the Table Was Created

1. Go to **Table Editor** in Supabase
2. You should see a new table called **subscriptions**
3. Click on it to verify the schema

---

## STEP 3: Set Up Stripe Webhooks

Stripe webhooks notify your app about subscription events (payments, cancellations, etc.)

### For Local Development (Testing)

1. **Install Stripe CLI** (if not already installed):
   ```bash
   # Windows (via Scoop)
   scoop install stripe

   # macOS
   brew install stripe/stripe-cli/stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```
   This will open your browser to authorize.

3. **Forward webhooks to your local server**:
   ```bash
   cd calendar-app
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** from the output:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx...
   ```

5. **Add to `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
   ```

6. **Keep this terminal running** while testing locally!

### For Production (After Deployment)

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your production environment variables

---

## STEP 4: Test the Integration

### Start Your Development Server

```bash
cd calendar-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Authentication Flow

1. **Sign Up**:
   - Click "Sign up" or go to `/signup`
   - Create a test account: `test@example.com`
   - Check your email for confirmation (if enabled)
   - You should be redirected to `/pricing`

2. **Log In**:
   - Go to `/login`
   - Enter your credentials
   - Should redirect to home page

### Test Stripe Subscription Flow

1. **Start Free Trial**:
   - Go to `/pricing`
   - Click "Start Free Trial"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Click "Subscribe"

2. **Verify Webhook Events**:
   - Check the terminal where `stripe listen` is running
   - You should see events like:
     ```
     checkout.session.completed
     customer.subscription.created
     ```

3. **Check Database**:
   - Go to Supabase **Table Editor** → **subscriptions**
   - You should see a new row with your subscription data
   - Status should be `trialing` or `active`

### Test Subscription Status Check

1. Open browser console (F12)
2. Run this in the console:
   ```javascript
   fetch('/api/subscription/status')
     .then(r => r.json())
     .then(console.log)
   ```
3. You should see your subscription data

---

## STEP 5: Protect Your Calendar Page (Optional)

If you want to require an active subscription to use the calendar, update your middleware or main page.

### Option A: Add to Middleware (Recommended)

Edit `calendar-app/middleware.ts` and add subscription check:

```typescript
// Add this import at the top
import { hasActiveSubscription } from '@/lib/subscription'

// Add this inside the middleware function, after auth check:
if (isProtectedPath && user) {
  const hasSubscription = await hasActiveSubscription()

  if (!hasSubscription && request.nextUrl.pathname === '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/pricing'
    return NextResponse.redirect(redirectUrl)
  }
}
```

### Option B: Add Client-Side Check

Add this to the top of your `app/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Inside your component:
const [hasAccess, setHasAccess] = useState(false)
const [loading, setLoading] = useState(true)
const router = useRouter()

useEffect(() => {
  fetch('/api/subscription/status')
    .then(r => r.json())
    .then(data => {
      if (!data.hasAccess) {
        router.push('/pricing')
      } else {
        setHasAccess(true)
        setLoading(false)
      }
    })
}, [router])

if (loading) {
  return <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white">Loading...</div>
  </div>
}

if (!hasAccess) {
  return null
}

// Rest of your calendar component...
```

---

## 🎯 Testing Checklist

- [ ] User can sign up successfully
- [ ] User can log in successfully
- [ ] User is redirected to pricing after signup
- [ ] Stripe checkout opens correctly
- [ ] Test payment succeeds
- [ ] Subscription appears in Supabase database
- [ ] Subscription status API returns correct data
- [ ] Stripe webhook events are received
- [ ] User can access calendar with active subscription

---

## 🔧 Common Issues & Solutions

### Issue: "Invalid signature" webhook error

**Solution**: Make sure your `STRIPE_WEBHOOK_SECRET` matches the one from `stripe listen` output.

### Issue: Subscription not appearing in database

**Solution**:
1. Check Stripe webhook logs: `stripe listen` terminal
2. Check Supabase logs: Dashboard → Logs → Postgres Logs
3. Verify the SQL migration ran successfully
4. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Issue: User stuck in redirect loop

**Solution**: Check middleware logic. Ensure `/pricing` and `/login` are not in `protectedPaths`.

### Issue: "No subscription found" for paid user

**Solution**:
1. Check that webhook events are being received
2. Verify subscription has `supabase_user_id` in metadata
3. Check Stripe webhook signing secret is correct

---

## 🚀 Deploying to Production

### 1. Deploy to Vercel (Recommended for Next.js)

```bash
cd calendar-app
vercel
```

Or connect your GitHub repo to Vercel:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set **Root Directory**: `calendar-app`

### 2. Add Production Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all values from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (production webhook secret)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`
- `NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID`
- `NEXT_PUBLIC_APP_URL` (your production URL)

### 3. Update Supabase URLs

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: Add `https://yourdomain.com/auth/callback`

### 4. Set Up Production Stripe Webhooks

See "For Production" section in Step 3 above.

### 5. Switch Stripe to Live Mode

1. In Stripe Dashboard, toggle from **Test Mode** to **Live Mode**
2. Create new products/prices for live mode
3. Update environment variables with **live mode** keys (starting with `pk_live_` and `sk_live_`)

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

---

## 🎉 You're All Set!

Your app now has:
- ✅ User authentication (email/password)
- ✅ Free trial subscription
- ✅ Paid monthly subscription
- ✅ Subscription management
- ✅ Protected routes

Next steps:
- Customize your pricing plans
- Add more payment options (yearly, etc.)
- Implement subscription management UI (cancel, upgrade, etc.)
- Add email notifications for subscription events
