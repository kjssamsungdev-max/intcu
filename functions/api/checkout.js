// POST /api/checkout — Creates Stripe Checkout session
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { plan, interval, email } = await request.json();
    if (!plan || !email) {
      return new Response(JSON.stringify({ error: "Missing plan or email" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ url: null, message: "Billing not configured" }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Map plan + interval to price IDs
    const priceMap = {
      "pro-month": env.STRIPE_PRICE_PRO_MONTHLY,
      "pro-year": env.STRIPE_PRICE_PRO_YEARLY,
      "team-month": env.STRIPE_PRICE_TEAM_MONTHLY,
      "team-year": env.STRIPE_PRICE_TEAM_YEARLY,
    };

    const priceId = priceMap[`${plan}-${interval || "month"}`];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan/interval" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Create Stripe Checkout session
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("customer_email", email);
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", "https://intcu.com?upgraded=true");
    params.append("cancel_url", "https://intcu.com?cancelled=true");

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (session.url) {
      return new Response(JSON.stringify({ url: session.url }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ url: null, error: session.error?.message || "Stripe error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ url: null, error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
