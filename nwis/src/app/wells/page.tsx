import type { Metadata } from "next";
import { WellsTable } from "./wells-table";

export const metadata: Metadata = { title: "Well Records" };

export default function WellsPage() {
  return <WellsTable />;
}
