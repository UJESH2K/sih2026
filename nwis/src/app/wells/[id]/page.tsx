import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WELLS, WELL_BY_ID } from "@/data/wells";
import { WellDetail } from "./well-detail";
import type { WellTab } from "@/components/well/well-tabs";

export function generateStaticParams() {
  return WELLS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: PageProps<"/wells/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: id };
}

const TABS: WellTab[] = ["overview", "depth", "timeline", "casing", "events", "docs"];

export default async function WellPage({ params, searchParams }: PageProps<"/wells/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const well = WELL_BY_ID[id];
  if (!well) notFound();
  const tab = TABS.includes(sp.tab as WellTab) ? (sp.tab as WellTab) : "overview";
  return (
    <WellDetail
      id={id}
      tab={tab}
      event={typeof sp.event === "string" ? sp.event : undefined}
      doc={typeof sp.doc === "string" ? sp.doc : undefined}
    />
  );
}
