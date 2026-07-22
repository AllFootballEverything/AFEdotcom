"use client";

import Image from "next/image";
import { useState } from "react";

import { applyDiscount, formatPrice } from "@/lib/format";
import type { Product } from "@/sanity/types";

/**
 * A product tile with inline buy.
 *
 * The displayed member price is recomputed server-side at checkout — this is
 * presentation only, never the figure that gets charged.
 */
export function ProductCard({
  product,
  image,
  isMember,
}: {
  product: Product;
  image?: string;
  isMember: boolean;
}) {
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const discount = isMember ? (product.memberDiscountPercent ?? 0) : 0;
  const finalPrice = applyDiscount(product.priceCents, discount);

  async function buy() {
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: product.slug, size }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="group flex flex-col border border-black/[0.09] bg-white transition-colors hover:border-volt">
      <div className="relative aspect-square overflow-hidden bg-bone">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {product.badge ? (
          <span className="absolute left-3 top-3 bg-volt px-2 py-1 font-sans text-[10px] font-black tracking-[0.08em] text-[#1a1a1a]">
            {product.badge}
          </span>
        ) : null}
        {!product.inStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="bg-ink px-3 py-2 font-sans text-[11px] font-black tracking-[0.08em] text-volt">
              SOLD OUT
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-sans text-sm font-bold uppercase leading-tight text-ink">
          {product.name}
        </h3>

        <p className="m-0 flex items-baseline gap-2">
          <span className="font-display text-lg text-ink">
            {formatPrice(finalPrice, product.currency)}
          </span>
          {discount > 0 ? (
            <>
              <span className="font-mono text-xs text-ink/40 line-through">
                {formatPrice(product.priceCents, product.currency)}
              </span>
              <span className="bg-volt px-1.5 py-0.5 font-sans text-[9px] font-black tracking-[0.08em] text-[#1a1a1a]">
                MEMBER
              </span>
            </>
          ) : null}
        </p>

        {product.sizes && product.sizes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                aria-pressed={size === option}
                className={`border px-2.5 py-1.5 font-sans text-[11px] font-bold tracking-[0.06em] transition-colors ${
                  size === option
                    ? "border-ink bg-ink text-volt"
                    : "border-black/20 text-ink/70 hover:border-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <span role="alert" className="font-sans text-[11px] font-bold text-rust">
            {error}
          </span>
        ) : null}

        <button
          type="button"
          onClick={buy}
          disabled={pending || !product.inStock}
          className="mt-auto bg-ink px-4 py-3 font-sans text-xs font-black tracking-[0.08em] text-volt transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!product.inStock ? "SOLD OUT" : pending ? "…" : "ADD TO BAG →"}
        </button>
      </div>
    </article>
  );
}
