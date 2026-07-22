import { type NextRequest, NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";
import { siteUrl } from "@/lib/env";
import { applyDiscount } from "@/lib/format";
import { getStripe } from "@/lib/stripe";
import { imageSrc } from "@/sanity/image";
import { getProductBySlug } from "@/sanity/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout session for a single product.
 *
 * Price, currency and discount are all resolved server-side from Sanity and
 * the viewer's membership — the request body only names the product. Anything
 * else would let a caller set their own price.
 */
export async function POST(request: NextRequest) {
  let payload: { slug?: unknown; size?: unknown; quantity?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const slug = typeof payload.slug === "string" ? payload.slug : "";
  const size = typeof payload.size === "string" ? payload.size.slice(0, 20) : "";
  const quantity = Math.min(
    Math.max(Number.parseInt(String(payload.quantity ?? 1), 10) || 1, 1),
    10,
  );

  if (!slug) {
    return NextResponse.json({ error: "Missing product" }, { status: 400 });
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (!product.inStock) {
    return NextResponse.json({ error: "Out of stock" }, { status: 409 });
  }
  if (product.sizes?.length && !product.sizes.includes(size)) {
    return NextResponse.json({ error: "Pick a size" }, { status: 400 });
  }

  const viewer = await getViewer();
  const discount = viewer.tier ? (product.memberDiscountPercent ?? 0) : 0;
  const unitAmount = applyDiscount(product.priceCents, discount);

  try {
    const stripe = getStripe();
    const image = imageSrc(product.images?.[0], 800);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity,
          price_data: {
            currency: product.currency,
            unit_amount: unitAmount,
            product_data: {
              name: size ? `${product.name} — ${size}` : product.name,
              ...(image && { images: [image] }),
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: [
          "GB", "IE", "DK", "SE", "NO", "FI", "NL", "BE", "DE", "FR",
          "ES", "IT", "PT", "AT", "CH", "PL", "US", "CA",
        ],
      },
      ...(viewer.email && { customer_email: viewer.email }),
      metadata: {
        productId: product._id,
        productSlug: product.slug,
        size: size || "one-size",
        whopUserId: viewer.whopUserId ?? "",
        memberTier: viewer.tier ?? "",
        discountPercent: String(discount),
      },
      success_url: `${siteUrl}/shop?checkout=success`,
      cancel_url: `${siteUrl}/shop?checkout=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe returned a session without a URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] failed to create session", error);
    return NextResponse.json(
      { error: "Could not start checkout. Try again." },
      { status: 500 },
    );
  }
}
