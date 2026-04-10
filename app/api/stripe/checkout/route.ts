import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, siteUrl } from "@/lib/stripe/server";
import { planIdToPriceId } from "@/lib/stripe/plan-from-price";
import type { BillingPlanId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { planId?: string };
    const planId = body.planId as BillingPlanId | undefined;
    if (planId !== "starter" && planId !== "growth" && planId !== "pro") {
      return NextResponse.json({ error: "Ongeldig abonnement" }, { status: 400 });
    }
    const priceId = planIdToPriceId(planId);
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe-prijs niet ingesteld voor dit abonnement (zet STRIPE_PRICE_*).",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { data: company, error: coErr } = await supabase
      .from("companies")
      .select("id, stripe_customer_id")
      .eq("owner_user_id", user.id)
      .single();

    if (coErr || !company) {
      return NextResponse.json({ error: "Geen bedrijfsprofiel" }, { status: 400 });
    }

    const stripe = getStripe();
    let customerId = company.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { company_id: company.id },
      });
      customerId = customer.id;
      await supabase
        .from("companies")
        .update({ stripe_customer_id: customerId })
        .eq("id", company.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl()}/dashboard?paid=1`,
      cancel_url: `${siteUrl()}/dashboard/upgrade?checkout=canceled`,
      metadata: { company_id: company.id, plan_id: planId },
      subscription_data: {
        metadata: { company_id: company.id, plan_id: planId },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe gaf geen checkout-URL terug" },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout mislukt" },
      { status: 500 },
    );
  }
}
