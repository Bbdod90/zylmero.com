import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { upsertCompanyFromStripeSubscription } from "@/lib/stripe/sync-subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or STRIPE_WEBHOOK_SECRET", {
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createAdminClient();
  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const companyId = session.metadata?.company_id;
        const subId = session.subscription as string | null;
        const customerId = session.customer as string | null;
        if (!companyId || !subId || !customerId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertCompanyFromStripeSubscription(
          admin,
          companyId,
          sub,
          customerId,
        );
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        let companyId = sub.metadata?.company_id as string | undefined;
        const customerId = sub.customer as string;
        if (!companyId) {
          const { data } = await admin
            .from("companies")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          companyId = data?.id;
        }
        if (!companyId) break;
        await upsertCompanyFromStripeSubscription(
          admin,
          companyId,
          sub,
          customerId,
        );
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        let companyId = sub.metadata?.company_id as string | undefined;
        if (!companyId) {
          const { data } = await admin
            .from("companies")
            .select("id")
            .eq("stripe_subscription_id", sub.id)
            .maybeSingle();
          companyId = data?.id;
        }
        if (!companyId) break;
        const { error } = await admin
          .from("companies")
          .update({
            stripe_subscription_id: null,
            subscription_status: "canceled",
            is_active: false,
            current_period_end: null,
          })
          .eq("id", companyId);
        if (error) throw new Error(error.message);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error(e);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}
