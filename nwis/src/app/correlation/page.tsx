import type { Metadata } from "next";
import { CorrelationView } from "./correlation-view";

export const metadata: Metadata = { title: "Offset Correlation" };

export default function CorrelationPage() {
  return <CorrelationView />;
}
