import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await handleSubscriptionChange(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        await handleSubscriptionDeletion(deletedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer
  const status = subscription.status
  const planId = subscription.items.data[0].price.lookup_key || 'free'

  // Get user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update or create subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      plan_id: planId,
      status: status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })

  if (subError) {
    console.error('Error updating subscription:', subError)
  }

  // Update user plan
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ plan_id: planId })
    .eq('id', user.id)

  if (userUpdateError) {
    console.error('Error updating user plan:', userUpdateError)
  }
}

async function handleSubscriptionDeletion(subscription: any) {
  const customerId = subscription.customer

  // Get user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update subscription status
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)

  if (subError) {
    console.error('Error updating subscription status:', subError)
  }

  // Reset user to free plan
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ plan_id: 'free' })
    .eq('id', user.id)

  if (userUpdateError) {
    console.error('Error updating user plan:', userUpdateError)
  }
} 