"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appUrl, getStripe } from "@/lib/stripe";

export type CheckoutState = { error?: string };

/**
 * Start checkout for `courseId`. Bound from a <form>:
 *   `action={checkoutCourse.bind(null, courseId)}`
 */
export async function checkoutCourse(
  courseId: string,
  _prevState: CheckoutState,
  _formData: FormData
): Promise<CheckoutState> {
  // 1. Identity — only students purchase.
  const session = await auth();
  if (!session?.user) {
    const callback = encodeURIComponent(`/courses/${courseId}`);
    redirect(`/login?callbackUrl=${callback}`);
  }
  if (session.user.role !== "STUDENT") {
    redirect(`/courses/${courseId}`);
  }

  // 2. Course must be published and actually cost money.
  const course = await prisma.course.findFirst({
    where: { id: courseId, published: true },
    select: { id: true, title: true, price: true },
  });
  if (!course || course.price <= 0) {
    redirect(`/courses/${courseId}`);
  }

  // 3. Already enrolled → no need to pay twice.
  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
    },
  });
  if (existing) {
    redirect(`/courses/${courseId}`);
  }

  // 4. Stripe must be configured (STRIPE_SECRET_KEY in .env).
  const stripe = getStripe();
  if (!stripe) {
    return {
      error: "Payments are not configured yet. Contact the site owner.",
    };
  }

  // 5. Create the Checkout Session.
  //    metadata carries courseId + userId through to the webhook,
  //    where we re-verify the user and create the enrollment.
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: course.title },
          unit_amount: course.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: session.user.id,
    },
    success_url: `${appUrl()}/courses/${course.id}?purchase=success`,
    cancel_url: `${appUrl()}/courses/${course.id}`,
  });

  // 6. Send the student to Stripe's hosted checkout page.
  if (!checkout.url) {
    return { error: "Could not create checkout session." };
  }
  redirect(checkout.url);
}
