import type { Metadata } from "next";

import { PageHeader } from "@/components/sections/PageHeader";
import { ProductCard } from "@/components/sections/ProductCard";
import { getViewer } from "@/lib/auth/viewer";
import { imageSrc } from "@/sanity/image";
import { getProducts, getShopPage } from "@/sanity/queries";
import { safeFetch } from "@/sanity/safe";

// Member pricing is viewer-specific.
export const dynamic = "force-dynamic";

const DEFAULTS = {
  kicker: "SHOP — AFE KIT",
  headline: "Wear it|*like you mean it.*",
  intro:
    "Training kit and everyday pieces, made for the people who actually use them. Limited runs, restocked when we can.",
};

export const metadata: Metadata = {
  title: "Shop",
  description: DEFAULTS.intro,
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [page, products, viewer, params] = await Promise.all([
    safeFetch(getShopPage, null, "shopPage"),
    safeFetch(getProducts, [], "products"),
    getViewer(),
    searchParams,
  ]);

  const isMember = viewer.tier !== null;

  return (
    <div className="animate-[afe-fadeup_0.45s_ease_both]">
      {params.checkout === "success" ? (
        <div className="bg-volt px-6 py-4 font-sans text-sm font-bold text-[#1a1a1a] lg:px-12">
          Order confirmed — check your inbox for the receipt. &apos;Til the wheels fall
          off.
        </div>
      ) : null}
      {params.checkout === "cancelled" ? (
        <div className="border-b border-white/[0.14] bg-ink-deep px-6 py-4 font-sans text-sm text-cream/70 lg:px-12">
          Checkout cancelled — your bag is still here.
        </div>
      ) : null}

      <PageHeader
        kicker={page?.kicker ?? DEFAULTS.kicker}
        headline={page?.headline ?? DEFAULTS.headline}
        intro={page?.intro ?? DEFAULTS.intro}
      >
        {page?.memberPerkNote && !isMember ? (
          <p className="mt-6 font-mono text-xs font-medium tracking-[0.08em] text-volt">
            {page.memberPerkNote}
          </p>
        ) : null}
      </PageHeader>

      <section className="bg-bone px-6 py-14 text-ink lg:px-12">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  image={imageSrc(product.images?.[0], 800)}
                  isMember={isMember}
                />
              ))}
            </div>

            {page?.shippingNote ? (
              <p className="mt-8 font-mono text-[11px] font-medium tracking-[0.08em] text-ink/50">
                {page.shippingNote}
              </p>
            ) : null}
          </>
        ) : (
          <p className="font-sans text-sm text-ink/60">
            New drop landing soon. Check back shortly.
          </p>
        )}
      </section>
    </div>
  );
}
