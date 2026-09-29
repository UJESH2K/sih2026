import { cn } from "@/lib/utils";

/** NWIS mark: the active rig (centre) with nearby wells on a radius ring. */
export function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="white" strokeOpacity=".45" strokeWidth="1.4" strokeDasharray="2.2 2.4" />
      <circle cx="16" cy="16" r="3.2" fill="white" />
      <circle cx="22.6" cy="10.6" r="1.9" fill="white" fillOpacity=".85" />
      <circle cx="9.2" cy="20.4" r="1.9" fill="white" fillOpacity=".85" />
      <circle cx="21.4" cy="23" r="1.5" fill="white" fillOpacity=".6" />
    </svg>
  );
}

/** Compact wordmark: mark + "NWIS". */
export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Logo className="size-7" />
      <span className="leading-none">
        <span className="block text-[17px] font-bold tracking-tight">NWIS</span>
        {sub && <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{sub}</span>}
      </span>
    </span>
  );
}
