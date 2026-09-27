import type { Metadata } from "next";
import { DocumentsView } from "./documents-view";

export const metadata: Metadata = { title: "Document AI" };

export default function DocumentsPage() {
  return <DocumentsView />;
}
