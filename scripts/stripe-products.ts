/**
 * One-off script: creates Stripe Products + recurring EUR monthly Prices.
 * Run: npx tsx scripts/stripe-products.ts
 * Requires STRIPE_SECRET_KEY in env.
 */
import Stripe from "stripe";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("Set STRIPE_SECRET_KEY");
    process.exit(1);
  }
  const stripe = new Stripe(key, { typescript: true });

  const plans = [
    { id: "starter", name: "Zylmero Starter", amount: 2900 },
    { id: "growth", name: "Zylmero Pro", amount: 4900 },
    { id: "pro", name: "Zylmero Business", amount: 7900 },
  ] as const;

  for (const p of plans) {
    const product = await stripe.products.create({
      name: p.name,
      metadata: { plan_id: p.id },
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: "eur",
      recurring: { interval: "month" },
      metadata: { plan_id: p.id },
    });
    console.log(`${p.id}: STRIPE_PRICE_${p.id.toUpperCase()}=${price.id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
