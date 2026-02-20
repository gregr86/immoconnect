import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { subscription, invoice, user } from "../db/schema";
import { authMiddleware, requireAuth } from "../middleware/auth";
import { stripe, PLANS, getPlanById } from "../lib/stripe";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

// Webhook route (sans auth, avant CORS)
export const webhookRoute = new Elysia().post(
  "/api/subscriptions/webhook",
  async ({ request, set }) => {
    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      set.status = 400;
      return { error: "Missing signature" };
    }

    const rawBody = await request.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
      );
    } catch (err: any) {
      set.status = 400;
      return { error: `Webhook signature verification failed: ${err.message}` };
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId || !planId) break;

        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        await db.insert(subscription).values({
          id: nanoid(),
          userId,
          plan: planId as any,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: stripeSubscription.items.data[0]?.price.id,
          currentPeriodStart: new Date(
            stripeSubscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(
            stripeSubscription.current_period_end * 1000,
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Mettre à jour le stripeCustomerId sur le user
        await db
          .update(user)
          .set({ stripeCustomerId: session.customer as string })
          .where(eq(user.id, userId));
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        await db
          .update(subscription)
          .set({
            status: sub.status === "active" ? "active" : "past_due",
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(subscription.stripeSubscriptionId, sub.id));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await db
          .update(subscription)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscription.stripeSubscriptionId, sub.id));
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object;
        const subId = inv.subscription as string | null;

        // Trouver l'abonnement pour récupérer le userId
        let userId: string | null = null;
        if (subId) {
          const sub = await db.query.subscription.findFirst({
            where: eq(subscription.stripeSubscriptionId, subId),
          });
          userId = sub?.userId ?? null;
        }

        if (userId) {
          await db.insert(invoice).values({
            id: nanoid(),
            userId,
            subscriptionId: subId
              ? (
                  await db.query.subscription.findFirst({
                    where: eq(subscription.stripeSubscriptionId, subId),
                  })
                )?.id
              : null,
            stripeInvoiceId: inv.id,
            amountTtc: inv.amount_paid,
            amountHt: inv.subtotal,
            status: "paid",
            description: inv.description || `Facture ${inv.number}`,
            invoiceDate: new Date(inv.created * 1000),
            paidAt: new Date(),
            invoicePdfUrl: inv.invoice_pdf,
            createdAt: new Date(),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object;
        const subId = inv.subscription as string | null;

        if (subId) {
          await db
            .update(subscription)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscription.stripeSubscriptionId, subId));
        }
        break;
      }
    }

    return { received: true };
  },
);

// Routes protégées
export const subscriptionRoutes = new Elysia({
  prefix: "/api/subscriptions",
})
  .use(authMiddleware)
  // Plans tarifaires
  .get("/plans", () => {
    return {
      plans: PLANS.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        features: p.features,
        recommended: p.recommended || false,
      })),
    };
  })

  // Routes authentifiées
  .use(requireAuth)
  // Abonnement actuel
  .get("/current", async ({ user: currentUser }) => {
    const sub = await db.query.subscription.findFirst({
      where: eq(subscription.userId, currentUser!.id),
      orderBy: desc(subscription.createdAt),
    });

    if (!sub) {
      return { subscription: null };
    }

    const plan = getPlanById(sub.plan);

    return {
      subscription: {
        ...sub,
        planName: plan?.name,
        planFeatures: plan?.features,
      },
    };
  })

  // Créer une session Stripe Checkout
  .post(
    "/checkout",
    async ({ body, user: currentUser, set }) => {
      const plan = getPlanById(body.planId);
      if (!plan) {
        set.status = 400;
        return { error: "Plan invalide" };
      }

      const priceId =
        body.interval === "yearly"
          ? plan.stripePriceYearly
          : plan.stripePriceMonthly;

      if (!priceId || priceId === "price_placeholder") {
        set.status = 400;
        return {
          error:
            "Les prix Stripe ne sont pas encore configurés. Configurez les variables d'environnement STRIPE_PRICE_*.",
        };
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${FRONTEND_URL}/subscription?success=true`,
        cancel_url: `${FRONTEND_URL}/subscription?canceled=true`,
        metadata: {
          userId: currentUser!.id,
          planId: body.planId,
        },
        customer_email: currentUser!.email,
      });

      return { url: session.url };
    },
    {
      body: t.Object({
        planId: t.String(),
        interval: t.Optional(t.String()),
      }),
    },
  )

  // Portail client Stripe
  .post("/portal", async ({ user: currentUser, set }) => {
    const sub = await db.query.subscription.findFirst({
      where: eq(subscription.userId, currentUser!.id),
      orderBy: desc(subscription.createdAt),
    });

    if (!sub?.stripeCustomerId) {
      set.status = 400;
      return { error: "Aucun abonnement actif" };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${FRONTEND_URL}/subscription`,
    });

    return { url: session.url };
  })

  // Historique factures
  .get(
    "/invoices",
    async ({ user: currentUser, query }) => {
      const page = parseInt(query.page || "1");
      const limit = parseInt(query.limit || "20");
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(invoice)
        .where(eq(invoice.userId, currentUser!.id))
        .orderBy(desc(invoice.invoiceDate))
        .limit(limit)
        .offset(offset);

      return { items, page, limit };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  );
