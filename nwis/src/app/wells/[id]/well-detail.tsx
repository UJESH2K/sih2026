"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/common/risk";
import { WellTabs, type WellTab } from "@/components/well/well-tabs";
import { ACTIVE_WELL, WELL_BY_ID } from "@/data/wells";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { distanceKm, compass, bearingDeg } from "@/lib/geo";

export function WellDetail({ id, tab, event, doc }: { id: string; tab: WellTab; event?: string; doc?: string }) {
  const well = WELL_BY_ID[id];
  const { t, lang } = useI18n();
  const router = useRouter();
  const compareIds = useApp((s) => s.compareIds);
  const toggleCompare = useApp((s) => s.toggleCompare);
  const d = distanceKm(ACTIVE_WELL, well);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
      <Link href="/wells" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("nav_wells")}
      </Link>
      <header className="mt-2 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-3xl font-bold">{well.id}</h1>
            <StatusDot status={well.status} withLabel className="text-sm" />
            <span className="rounded border px-2 py-0.5 text-xs text-muted-foreground">{well.purpose}</span>
          </div>
          <p className="mt-1 text-muted-foreground">
            {well.result}
            {well.id !== ACTIVE_WELL.id && (
              <>
                {" "}
                · {d.toFixed(2)} km {compass(bearingDeg(ACTIVE_WELL, well))} {lang === "hi" ? "सक्रिय कुएँ से" : "of active well"}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const s = useApp.getState();
              s.selectWell(well.id);
              s.flyTo(well.lng, well.lat, 13.4);
              router.push("/map");
            }}
          >
            <MapPin /> {lang === "hi" ? "नक्शे पर देखें" : "Show on map"}
          </Button>
          {well.id !== ACTIVE_WELL.id && well.status !== "planned" && (
            <Button variant="outline" onClick={() => toggleCompare(well.id)}>
              <Rows3 /> {compareIds.includes(well.id) ? `✓ ${t("inCompare")}` : t("addCompare")}
            </Button>
          )}
        </div>
      </header>
      <div className="mt-4">
        <WellTabs well={well} initialTab={tab} initialEvent={event} initialDoc={doc} />
      </div>
    </div>
  );
}
