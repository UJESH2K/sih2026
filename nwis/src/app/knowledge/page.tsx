import type { Metadata } from "next";
import { Suspense } from "react";
import { KnowledgeView } from "./knowledge-view";

export const metadata: Metadata = { title: "Knowledge Search" };

export default function KnowledgePage() {
  return (
    <Suspense>
      <KnowledgeView />
    </Suspense>
  );
}
