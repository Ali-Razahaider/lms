import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Payments not configured — acknowledge but don't process.
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    // Bad signature → reject loudly so Stripe retries and we get logs.
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    if (courseId && userId) {
      // Upsert = idempotent: Stripe may retry the same webhook, and
      // that must not create duplicate enrollments.
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: { userId, courseId },
      });

      // The course page shows "Enrolled" state now — purge its cache.
      revalidatePath(`/courses/${courseId}`);
      revalidatePath("/dashboard");
    }
  }

  return NextResponse.json({ received: true });
}
