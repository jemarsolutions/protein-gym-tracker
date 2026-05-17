import { NextResponse } from "next/server";
import Stripe from "stripe";
import { pool } from "@/db";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  try {
    // Read the raw body as text for Stripe signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // Verify the webhook payload was actually sent by Stripe
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Process the exact event type we care about
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // We pass the user ID in the client_reference_id when creating the Checkout Session
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;

        if (userId) {
          console.log(`Upgrading User ${userId} to Premium...`);

          // 1. Upgrade the user in the database
          await pool.query(
            `UPDATE users SET is_premium = true WHERE id = $1`,
            [userId]
          );

          // 2. Log the subscription details if it exists
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = (subscription as any).items?.data?.[0]?.price?.id || "unknown";
            
            const periodEndNum = (subscription as any).current_period_end;
            const currentPeriodEnd = new Date(periodEndNum ? periodEndNum * 1000 : Date.now());

            await pool.query(
              `INSERT INTO subscriptions (id, user_id, status, price_id, current_period_end)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (id) DO UPDATE 
               SET status = EXCLUDED.status, 
                   current_period_end = EXCLUDED.current_period_end`,
              [subscriptionId, userId, subscription.status, priceId, currentPeriodEnd]
            );
          }
        }
        break;
      }
      
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // If the subscription is no longer active, we should revoke premium access
        const isPremium = subscription.status === "active" || subscription.status === "trialing";
        
        const periodEndNum = (subscription as any).current_period_end;
        const currentPeriodEnd = new Date(periodEndNum ? periodEndNum * 1000 : Date.now());
        
        // Update subscription record
        const result = await pool.query(
          `UPDATE subscriptions 
           SET status = $1, current_period_end = $2 
           WHERE id = $3 RETURNING user_id`,
          [subscription.status, currentPeriodEnd, subscription.id]
        );

        const userId = result.rows[0]?.user_id;

        // Sync the user's premium flag
        if (userId) {
          await pool.query(
            `UPDATE users SET is_premium = $1 WHERE id = $2`,
            [isPremium, userId]
          );
        }
        break;
      }
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // Always return a 200 to let Stripe know we received it
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error(`Webhook processing error: ${err.message}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
