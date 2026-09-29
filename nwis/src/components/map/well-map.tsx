"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, ScaleControl, useControl, type MapRef } from "react-map-gl/maplibre";
import { MapboxOverlay, type MapboxOverlayProps } from "@deck.gl/mapbox";
import { ColumnLayer, LineLayer, PathLayer, PolygonLayer, TextLayer } from "@deck.gl/layers";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import type { PickingInfo } from "@deck.gl/core";
import { useTheme } from "next-themes";
import type { StyleSpecification } from "maplibre-gl";
import { ACTIVE_WELL, WELLS, ALL_EVENTS, WELL_BY_ID } from "@/data/wells";
import type { Well } from "@/data/types";
import { useApp } from "@/store/app";
import { circleRing, distanceKm, offsetPoint, compass, bearingDeg } from "@/lib/geo";
import { STATUS_META, EVENT_META } from "@/lib/event-meta";
import { useI18n } from "@/lib/i18n";

function DeckOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const SATELLITE: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 18,
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri", type: "raster", source: "esri" }],
};

const fallbackStyle = (dark: boolean): StyleSpecification => ({
  version: 8,
  sources: {},
  layers: [{ id: "bg", type: "background", paint: { "background-color": dark ? "#1b222b" : "#eef1f4" } }],
});

const FIELD_VIEW = { longitude: 95.332, latitude: 27.352, zoom: 12.35, pitch: 55, bearing: -18 };
const INDIA_VIEW = { longitude: 84, latitude: 23.5, zoom: 3.6, pitch: 0, bearing: 0 };

// jittered event positions around each well (for density hexagons)
const EVENT_POINTS = ALL_EVENTS.map((e, i) => {
  const w = WELL_BY_ID[e.wellId];
  const [lng, lat] = offsetPoint(w.lat, w.lng, 80 + (i % 5) * 60, (i * 67) % 360);
  return { lng, lat, weight: e.severity * (1 + e.npt_hours / 12), type: e.type };
});

export function WellMap({ intro = true }: { intro?: boolean }) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const { lang } = useI18n();
  const radiusKm = useApp((s) => s.radiusKm);
  const layers = useApp((s) => s.layers);
  const basemap = useApp((s) => s.basemap);
  const selected = useApp((s) => s.selectedWellId);
  const highlight = useApp((s) => s.highlightIds);
  const selectWell = useApp((s) => s.selectWell);
  const fly = useApp((s) => s.fly);
  const depth = useApp((s) => s.depth);
  const [grow, setGrow] = useState(intro ? 0 : 1);
  const [styleFailed, setStyleFailed] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // cinematic intro: India → Assam → field, then wells rise
  const onLoad = () => {
    const map = mapRef.current;
    if (!map) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("nwis.intro") === "1";
    } catch {}
    if (!intro || seen) {
      map.jumpTo({ center: [FIELD_VIEW.longitude, FIELD_VIEW.latitude], zoom: FIELD_VIEW.zoom, pitch: FIELD_VIEW.pitch, bearing: FIELD_VIEW.bearing });
      setGrow(1);
      return;
    }
    try {
      sessionStorage.setItem("nwis.intro", "1");
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo({
      center: [FIELD_VIEW.longitude, FIELD_VIEW.latitude],
      zoom: FIELD_VIEW.zoom,
      pitch: FIELD_VIEW.pitch,
      bearing: FIELD_VIEW.bearing,
      duration: reduce ? 0 : 4200,
      curve: 1.6,
      essential: true,
    });
    map.once("moveend", () => animateGrow(setGrow));
  };

  useEffect(() => {
    if (!fly) return;
    mapRef.current?.flyTo({ center: [fly.lng, fly.lat], zoom: fly.zoom ?? 13, pitch: 55, duration: 1600, essential: true });
  }, [fly]);

  // if the online basemap can't load (offline demo), fall back to a plain style
  useEffect(() => {
    setStyleFailed(false);
    const id = setTimeout(() => {
      const m = mapRef.current?.getMap();
      if (m && !m.isStyleLoaded()) setStyleFailed(true);
    }, 8000);
    return () => clearTimeout(id);
  }, [basemap, dark]);

  const mapStyle = styleFailed ? fallbackStyle(dark) : basemap === "satellite" ? SATELLITE : dark ? STYLES.dark : STYLES.light;

  const inRadius = useMemo(() => {
    const s = new Set<string>();
    for (const w of WELLS) if (w.id !== ACTIVE_WELL.id && distanceKm(ACTIVE_WELL, w) <= radiusKm) s.add(w.id);
    return s;
  }, [radiusKm]);

  const deckLayers = useMemo(() => {
    const out = [];
    const hl = new Set(highlight);
    const labelColor: [number, number, number, number] = dark || basemap === "satellite" ? [240, 244, 248, 255] : [25, 35, 50, 255];
    const labelBg: [number, number, number, number] = dark || basemap === "satellite" ? [20, 26, 34, 200] : [255, 255, 255, 220];

    if (layers.rings) {
      out.push(
        new PolygonLayer({
          id: "radius-fill",
          data: [{ ring: circleRing(ACTIVE_WELL.lat, ACTIVE_WELL.lng, radiusKm) }],
          getPolygon: (d: { ring: [number, number][] }) => d.ring,
          filled: true,
          stroked: true,
          getFillColor: [31, 111, 235, 22],
          getLineColor: [31, 111, 235, 200],
          getLineWidth: 3,
          lineWidthUnits: "pixels",
          updateTriggers: { getPolygon: radiusKm },
        }),
        new PathLayer({
          id: "rings",
          data: [1, 3, 5, 8].filter((r) => r !== radiusKm).map((r) => ({ r, path: circleRing(ACTIVE_WELL.lat, ACTIVE_WELL.lng, r) })),
          getPath: (d: { path: [number, number][] }) => d.path,
          getColor: dark ? [180, 200, 230, 90] : [60, 80, 110, 90],
          getWidth: 1.2,
          widthUnits: "pixels",
        }),
        new TextLayer({
          id: "ring-labels",
          data: [1, 3, 5, 8].map((r) => ({ r, pos: offsetPoint(ACTIVE_WELL.lat, ACTIVE_WELL.lng, r * 1000, 180) })),
          getPosition: (d: { pos: [number, number] }) => d.pos,
          getText: (d: { r: number }) => `${d.r} km`,
          getSize: 12,
          getColor: labelColor,
          background: true,
          getBackgroundColor: labelBg,
          backgroundPadding: [4, 2],
          fontFamily: "Public Sans, sans-serif",
          fontWeight: 600,
        }),
      );
    }

    if (layers.heat) {
      out.push(
        new HexagonLayer({
          id: "hex",
          data: EVENT_POINTS,
          getPosition: (d: (typeof EVENT_POINTS)[number]) => [d.lng, d.lat],
          getElevationWeight: (d: (typeof EVENT_POINTS)[number]) => d.weight,
          getColorWeight: (d: (typeof EVENT_POINTS)[number]) => d.weight,
          elevationAggregation: "SUM",
          colorAggregation: "SUM",
          radius: 450,
          extruded: true,
          elevationScale: 18 * grow,
          coverage: 0.88,
          opacity: 0.55,
          colorRange: [
            [255, 240, 200],
            [254, 217, 142],
            [254, 178, 76],
            [253, 141, 60],
            [240, 59, 32],
            [189, 0, 38],
          ],
          pickable: false,
        }),
      );
    }

    if (layers.links) {
      const linked = WELLS.filter((w) => inRadius.has(w.id));
      out.push(
        new LineLayer({
          id: "links",
          data: linked,
          getSourcePosition: () => [ACTIVE_WELL.lng, ACTIVE_WELL.lat],
          getTargetPosition: (w: Well) => [w.lng, w.lat],
          getColor: (w: Well) => (hl.has(w.id) || w.id === hoverId ? [220, 70, 40, 230] : [31, 111, 235, 120]),
          getWidth: (w: Well) => (hl.has(w.id) || w.id === hoverId ? 3 : 1.5),
          widthUnits: "pixels",
          updateTriggers: { getColor: [highlight, hoverId], getWidth: [highlight, hoverId] },
        }),
        new TextLayer({
          id: "link-labels",
          data: linked.filter((w, i) => i < 8 || hl.has(w.id) || w.id === hoverId),
          getPosition: (w: Well) => [(w.lng + ACTIVE_WELL.lng) / 2, (w.lat + ACTIVE_WELL.lat) / 2],
          getText: (w: Well) => `${distanceKm(ACTIVE_WELL, w).toFixed(1)} km`,
          getSize: 11,
          getColor: labelColor,
          background: true,
          getBackgroundColor: labelBg,
          backgroundPadding: [3, 1],
          fontFamily: "Public Sans, sans-serif",
          parameters: { depthCompare: "always" },
          updateTriggers: { data: [highlight, hoverId] },
        }),
      );
    }

    if (layers.trajectories) {
      const dev = WELLS.filter((w) => w.departure_m > 0);
      out.push(
        new PathLayer({
          id: "trajectories",
          data: dev,
          getPath: (w: Well) =>
            Array.from({ length: 9 }, (_, i) => {
              const f = i / 8;
              const [lng, lat] = offsetPoint(w.lat, w.lng, w.departure_m * f * f, w.azimuth_deg);
              return [lng, lat, 0] as [number, number, number];
            }),
          getColor: [142, 90, 200, 220],
          getWidth: 3,
          widthUnits: "pixels",
          capRounded: true,
        }),
      );
    }

    if (layers.wells) {
      const colorFor = (w: Well): [number, number, number, number] => {
        if (w.id === ACTIVE_WELL.id) return [31, 111, 235, 255];
        const base = STATUS_META[w.status].rgb;
        if (hl.size && !hl.has(w.id)) return [...base, 70] as [number, number, number, number];
        if (!inRadius.has(w.id)) return [150, 156, 165, 90];
        return [...base, 235] as [number, number, number, number];
      };
      out.push(
        new ColumnLayer({
          id: "wells",
          data: WELLS.filter((w) => w.status !== "planned"),
          diskResolution: 18,
          radius: 85,
          extruded: true,
          pickable: true,
          elevationScale: 0.32 * grow,
          getPosition: (w: Well) => [w.lng, w.lat],
          getElevation: (w: Well) => (w.id === ACTIVE_WELL.id ? depth : w.total_depth_m),
          getFillColor: colorFor,
          getLineColor: [255, 255, 255, 255],
          material: { ambient: 0.55, diffuse: 0.6, shininess: 24 },
          updateTriggers: { getFillColor: [radiusKm, highlight, dark], getElevation: depth },
          transitions: { getFillColor: 400 },
        }),
        // planned depth of the active well + planned wells as ghost wireframes
        new ColumnLayer({
          id: "planned",
          data: WELLS.filter((w) => w.status === "planned" || w.id === ACTIVE_WELL.id),
          diskResolution: 18,
          radius: 85,
          extruded: true,
          wireframe: true,
          filled: false,
          pickable: true,
          elevationScale: 0.32 * grow,
          getPosition: (w: Well) => [w.lng, w.lat],
          getElevation: (w: Well) => w.planned_depth_m,
          getLineColor: (w: Well) => (w.id === ACTIVE_WELL.id ? [31, 111, 235, 200] : [142, 124, 195, 220]),
        }),
        // ring highlight under selected / highlighted wells
        new PolygonLayer({
          id: "sel",
          data: WELLS.filter((w) => w.id === selected || hl.has(w.id) || w.id === hoverId),
          getPolygon: (w: Well) => circleRing(w.lat, w.lng, 0.16, 32),
          filled: true,
          stroked: true,
          getFillColor: (w: Well) => (hl.has(w.id) ? [220, 70, 40, 60] : [31, 111, 235, 50]),
          getLineColor: (w: Well) => (hl.has(w.id) ? [220, 70, 40, 255] : [31, 111, 235, 255]),
          getLineWidth: 2.5,
          lineWidthUnits: "pixels",
          updateTriggers: { getFillColor: highlight, getLineColor: highlight },
        }),
      );
    }

    if (layers.labels) {
      out.push(
        new TextLayer({
          id: "well-labels",
          data: WELLS,
          getPosition: (w: Well) => [w.lng, w.lat, (w.id === ACTIVE_WELL.id ? w.planned_depth_m : w.total_depth_m) * 0.32 * grow + 60],
          getText: (w: Well) => w.id,
          getSize: (w: Well) => (w.id === ACTIVE_WELL.id ? 15 : 12),
          getColor: (w: Well) => (!inRadius.has(w.id) && w.id !== ACTIVE_WELL.id ? [labelColor[0], labelColor[1], labelColor[2], 120] : labelColor),
          background: true,
          getBackgroundColor: labelBg,
          backgroundPadding: [4, 2],
          fontFamily: "Public Sans, sans-serif",
          fontWeight: 600,
          getPixelOffset: [0, -10],
          billboard: true,
          parameters: { depthCompare: "always" },
          updateTriggers: { getPosition: grow, getColor: [radiusKm, dark, basemap] },
        }),
      );
    }
    return out;
  }, [layers, radiusKm, inRadius, highlight, selected, hoverId, grow, depth, dark, basemap]);

  const tooltip = (info: PickingInfo) => {
    const w = info.object as Well | undefined;
    if (!w || !("id" in w)) return null;
    const d = distanceKm(ACTIVE_WELL, w);
    const st = STATUS_META[w.status];
    const evs = w.events
      .slice(0, 4)
      .map((e) => `<span style="color:${EVENT_META[e.type].color}">●</span> ${EVENT_META[e.type].label} @ ${e.depth_m} m`)
      .join("<br/>");
    return {
      html: `<div style="font-family:var(--font-public-sans);min-width:190px">
        <div style="font-weight:700;font-size:14px">${w.id} <span style="font-weight:500;font-size:11px;color:${st.color}">● ${lang === "hi" ? st.labelHi : st.label}</span></div>
        <div style="font-size:12px;opacity:.8;margin-top:2px">${w.id === ACTIVE_WELL.id ? (lang === "hi" ? "सक्रिय कुआँ" : "Active well") : `${d.toFixed(2)} km ${compass(bearingDeg(ACTIVE_WELL, w))}`} · TD ${w.total_depth_m.toLocaleString("en-IN")} m</div>
        ${evs ? `<div style="font-size:12px;margin-top:6px;line-height:1.5">${evs}</div>` : ""}
        <div style="font-size:11px;opacity:.65;margin-top:6px">${lang === "hi" ? "विवरण के लिए क्लिक करें" : "Click for details"}</div>
      </div>`,
      style: {
        background: dark ? "#1f2833" : "#ffffff",
        color: dark ? "#e8edf2" : "#1b2533",
        border: `1px solid ${dark ? "#334050" : "#d9dee5"}`,
        borderRadius: "8px",
        padding: "10px 12px",
        boxShadow: "0 6px 20px rgba(0,0,0,.15)",
      },
    };
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={intro ? INDIA_VIEW : FIELD_VIEW}
      mapStyle={mapStyle}
      onLoad={onLoad}
      maxPitch={70}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      <DeckOverlay
        interleaved
        layers={deckLayers}
        getTooltip={tooltip}
        onClick={(info) => {
          const w = info.object as Well | undefined;
          if (w?.id) selectWell(w.id);
        }}
        onHover={(info) => setHoverId((info.object as Well | undefined)?.id ?? null)}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      />
      <Marker longitude={ACTIVE_WELL.lng} latitude={ACTIVE_WELL.lat} anchor="center">
        <div className="pointer-events-none relative flex size-6 items-center justify-center" aria-label="Active rig">
          <span className="absolute inline-flex size-6 rounded-full bg-live/60 animate-pulse-ring" />
          <span className="relative size-3.5 rounded-full border-2 border-white bg-live shadow" />
        </div>
      </Marker>
      <NavigationControl position="top-right" visualizePitch />
      <ScaleControl position="top-right" />
    </Map>
  );
}

function animateGrow(set: (n: number) => void) {
  const start = performance.now();
  const dur = 1400;
  const step = (t: number) => {
    const x = Math.min(1, (t - start) / dur);
    set(1 - Math.pow(1 - x, 3));
    if (x < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function resetIntro() {
  try {
    sessionStorage.removeItem("nwis.intro");
  } catch {}
}
