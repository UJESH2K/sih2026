"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const mode = useApp((s) => s.mode);
  const newAlerts = useApp((s) => s.alerts.filter((a) => a.status === "new").length);
  const items = NAV.filter((n) => mode === "office" || n.field);
  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <nav aria-label="Main" className="flex flex-col gap-5 px-3 py-4">
      {sections.map((sec) => (
        <div key={sec}>
          <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{t(sec)}</p>
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
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="flex-1 leading-tight">
                        {t(item.label)}
                        {mode === "office" && (
                          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{item.desc[lang]}</span>
                        )}
                      </span>
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
  const { t } = useI18n();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">NWIS</p>
            <p className="text-[11px] text-muted-foreground">{t("companion")}</p>
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <SidebarNav />
      </div>
      <div className="border-t p-3 text-[11px] leading-snug text-muted-foreground">
        SIH 2026 · PS 26121 · Oil India Limited
        <br />
        {t("synthetic")}
      </div>
    </aside>
  );
}
