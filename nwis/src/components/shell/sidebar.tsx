"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";
import { Wordmark } from "./logo";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const mode = useApp((s) => s.mode);
  const newAlerts = useApp((s) => s.alerts.filter((a) => a.status === "new").length);
  const items = NAV.filter((n) => mode === "office" || n.field);
  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <nav aria-label="Main" className="flex flex-col gap-6 px-3 py-5">
      {sections.map((sec) => (
        <div key={sec}>
          <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{t(sec)}</p>
          <ul className="flex flex-col gap-0.5">
            {items
              .filter((i) => i.section === sec)
              .map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      data-tour={`nav-${item.href.slice(1) || "home"}`}
                      aria-current={active ? "page" : undefined}
                      title={item.desc[lang]}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors",
                        active
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="flex-1 leading-tight">{t(item.label)}</span>
                      {item.href === "/live" && newAlerts > 0 && (
                        <span className="rounded-full bg-risk-high px-1.5 text-[11px] font-semibold text-white tabular">{newAlerts}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { t, lang } = useI18n();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" aria-label="NWIS home">
          <Wordmark sub={lang === "hi" ? "निकटवर्ती कुआँ इंटेलिजेंस" : "Nearby Wells Intelligence"} />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <SidebarNav />
      </div>
      <div className="px-6 py-4 text-[11px] leading-relaxed text-muted-foreground">
        SIH 2026 · PS 26121
        <br />
        {t("synthetic")}
      </div>
    </aside>
  );
}
