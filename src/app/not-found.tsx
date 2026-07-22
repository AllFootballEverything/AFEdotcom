import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-start justify-center gap-6 px-6 lg:px-12">
      <p className="afe-kicker">404 — OFF TARGET</p>
      <h1 className="font-display text-[clamp(40px,8vw,96px)] uppercase leading-[0.95]">
        Wrong <span className="text-volt">side</span>
        <br />
        of the pitch.
      </h1>
      <p className="max-w-[440px] font-sans text-base leading-[1.6] text-cream/75">
        That page doesn&apos;t exist. Head back and pick up where you left off.
      </p>
      <Link
        href="/"
        className="bg-volt px-6 py-4 font-sans text-xs font-black uppercase tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-rust hover:text-white"
      >
        BACK TO HOME →
      </Link>
    </div>
  );
}
