import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    });
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user subscription details (existing functionality)
    await db.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });

    // NEW CODE: Create an invoice for the initial subscription payment
    try {
      // Get the price information
      const priceId = subscription.items.data[0]?.price.id;
      const priceInfo = priceId ? await stripe.prices.retrieve(priceId) : null;
      const amount = priceInfo?.unit_amount
        ? priceInfo.unit_amount / 100
        : 29.99;

      // Create a PAID invoice
      await db.invoice.create({
        data: {
          amount,
          currency: priceInfo?.currency?.toUpperCase() || "USD",
          status: "PAID",
          paymentMethod: "Stripe",
          paymentId: session.id,
          subscriptionPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          subscriptionPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          description: `Initial subscription payment`,
          userId: session.metadata.userId,
          paidAt: new Date(),
          metadata: {
            checkoutSessionId: session.id,
            subscriptionId: subscription.id,
          },
        },
      });
    } catch (invoiceError) {
      console.error("Failed to create invoice:", invoiceError);
      // Don't return an error - we still want the webhook to succeed
      // even if invoice creation fails
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user subscription details (existing functionality)
    await db.user.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });

    // NEW CODE: Create an invoice for the renewal payment
    try {
      // Get the invoice details
      const invoiceObject = event.data.object as Stripe.Invoice;

      // Find the user associated with this subscription
      const user = await db.user.findFirst({
        where: {
          stripeSubscriptionId: subscription.id,
        },
      });

      if (user) {
        // Create a PAID invoice for the renewal
        await db.invoice.create({
          data: {
            amount: invoiceObject.amount_paid / 100, // Convert from cents to dollars
            currency: invoiceObject.currency.toUpperCase(),
            status: "PAID",
            paymentMethod: "Stripe",
            paymentId: invoiceObject.id,
            subscriptionPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            subscriptionPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            description: invoiceObject.description || "Subscription renewal",
            userId: user.id,
            paidAt: new Date(),
            metadata: {
              invoiceUrl: invoiceObject.hosted_invoice_url,
              invoicePdf: invoiceObject.invoice_pdf,
              subscriptionId: subscription.id,
            },
          },
        });
      }
    } catch (invoiceError) {
      console.error("Failed to create renewal invoice:", invoiceError);
      // Don't return an error - we still want the webhook to succeed
      // even if invoice creation fails
    }
  }

  return new Response(null, { status: 200 });
}
