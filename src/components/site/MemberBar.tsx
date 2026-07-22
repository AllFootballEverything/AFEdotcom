import { TIER_LABEL } from "@/lib/tiers";
import type { Viewer } from "@/lib/auth/viewer";

/**
 * Account strip at the top of the Members page.
 *
 * Signed out: the Whop sign-in prompt. Signed in: who you are, what you hold,
 * and a sign-out control. Sign-out is a real form POST — a GET endpoint could
 * be triggered by any third-party image tag.
 */
export function MemberBar({ viewer, error }: { viewer: Viewer; error?: string }) {
  if (!viewer.isSignedIn) {
    return (
      <div className="flex flex-col gap-4 border-b border-white/[0.14] bg-ink-deep px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <p className="m-0 font-sans text-sm text-cream/70">
          Already a member?{" "}
          <span className="text-cream">Sign in to unlock the Board and the library.</span>
        </p>
        <div className="flex items-center gap-4">
          {error ? (
            <span role="alert" className="font-sans text-xs font-bold text-rust">
              {ERROR_MESSAGES[error] ?? "SIGN-IN FAILED — TRY AGAIN"}
            </span>
          ) : null}
          <a
            href="/api/auth/whop/login?returnTo=/members"
            className="bg-volt px-5 py-3 font-sans text-xs font-black tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-rust hover:text-white"
          >
            SIGN IN WITH WHOP →
          </a>
        </div>
      </div>
    );
  }

  const displayName = viewer.name ?? viewer.username ?? "Member";

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.14] bg-ink-deep px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-12">
      <p className="m-0 font-sans text-sm text-cream/70">
        Signed in as <span className="font-bold text-cream">{displayName}</span>
        {viewer.tier ? (
          <>
            {" — "}
            <span className="font-bold text-volt">{TIER_LABEL[viewer.tier]}</span>
          </>
        ) : (
          " — no active membership"
        )}
      </p>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="border border-white/25 px-4 py-2.5 font-sans text-xs font-bold tracking-[0.08em] text-cream/80 transition-colors hover:border-volt hover:text-volt"
        >
          SIGN OUT
        </button>
      </form>
    </div>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "SIGN-IN CANCELLED",
  state_mismatch: "SESSION EXPIRED — TRY AGAIN",
  missing_params: "SIGN-IN INCOMPLETE — TRY AGAIN",
  exchange_failed: "COULD NOT REACH WHOP — TRY AGAIN",
  config: "SIGN-IN NOT CONFIGURED YET",
  oauth: "SIGN-IN FAILED — TRY AGAIN",
};
