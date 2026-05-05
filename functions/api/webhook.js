// POST /api/webhook — Stripe webhook handler
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    // Log event for debugging (full verification requires stripe SDK or manual sig check)
    console.log("Stripe webhook received:", body.slice(0, 200));

    // Parse event
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data?.object;
        const email = session?.customer_email;
        const subscriptionId = session?.subscription;
        console.log(`Checkout completed: ${email}, subscription: ${subscriptionId}`);
        // TODO: Update D1 users table with plan status
        // await env.DB.prepare("UPDATE users SET plan = ?, stripe_id = ? WHERE email = ?").bind("pro", subscriptionId, email).run();
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data?.object;
        console.log(`Subscription updated: ${sub?.id}, status: ${sub?.status}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data?.object;
        console.log(`Subscription cancelled: ${sub?.id}`);
        // TODO: Downgrade user to free in D1
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
