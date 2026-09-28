import type { Metadata } from "next";
import { MapView } from "./map-view";

export const metadata: Metadata = { title: "Nearby Wells Map" };

export default function MapPage() {
  return <MapView />;
}
