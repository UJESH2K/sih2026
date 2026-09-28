export function Logo({ className = "size-8" }: { className?: string }) {
  // Derrick + concentric offset rings — "nearby wells" mark.
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-primary" />
      <circle cx="16" cy="22" r="7.5" fill="none" stroke="white" strokeOpacity=".35" strokeWidth="1.2" />
      <circle cx="16" cy="22" r="3.8" fill="none" stroke="white" strokeOpacity=".6" strokeWidth="1.2" />
      <path d="M16 5 L11.5 22 M16 5 L20.5 22 M12.6 17.5 H19.4 M13.6 13 H18.4" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="22" r="1.6" fill="white" />
    </svg>
  );
}
