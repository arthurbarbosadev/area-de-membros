import Link from "next/link";

export function Brand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <Link href="/" className="flex items-center gap-3 group">
      <span
        className={`${dim} rounded-xl relative grid place-items-center bg-gradient-to-br from-marine-glow to-navy-glow shadow-[0_0_30px_-5px_rgba(46,209,184,0.55)]`}
      >
        <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_60%)] opacity-70" />
        <span className="font-display font-bold text-ink-950 z-10">L</span>
      </span>
      <span
        className={`font-display font-semibold tracking-tight ${text} text-white group-hover:text-marine-mint transition-colors`}
      >
        Low<span className="text-marine-mint">Digital</span>
      </span>
    </Link>
  );
}
