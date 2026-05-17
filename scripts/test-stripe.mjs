import Stripe from 'stripe';
import { config } from 'dotenv';
config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

async function run() {
  const subs = await stripe.subscriptions.list({ limit: 1 });
  if (subs.data.length > 0) {
    const subId = subs.data[0].id;
    const retrievedSub = await stripe.subscriptions.retrieve(subId);
    console.log("Retrieved keys:", Object.keys(retrievedSub));
    console.log("current_period_end:", retrievedSub.current_period_end);
    console.log("price id:", retrievedSub.items?.data?.[0]?.price?.id);
  } else {
    console.log("No subscriptions found to inspect.");
  }
}
run();
