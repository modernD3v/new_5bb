"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { PassBadges } from "@/components/passes/pass-badges";
import { seasonShortLabel } from "@/lib/season/status";
import { mountainDisplayColor } from "@/lib/snow/format";
import type { MountainScoreRow } from "@/lib/snow/get-scores";
import "leaflet/dist/leaflet.css";

const PIN_BASE = `color:#0a0a0a;display:flex;align-items:center;justify-content:center;
  font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);border-radius:9999px;`;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function pinIcon(m: MountainScoreRow) {
  const color = mountainDisplayColor(m);
  const offSeason = m.isIndoor ? null : seasonShortLabel(m.season);

  if (offSeason) {
    const width = Math.round(offSeason.length * 6.6 + 22);
    return L.divIcon({
      className: "",
      html: `<div style="${PIN_BASE}width:${width}px;height:26px;background:${color};font-size:11px;white-space:nowrap;"
        aria-label="${escapeHtml(m.name)}: ${offSeason}">${offSeason}</div>`,
      iconSize: [width, 26],
      iconAnchor: [width / 2, 13],
      popupAnchor: [0, -13],
    });
  }

  const label = m.isIndoor ? "⌂" : m.score == null ? "-" : String(m.score);
  return L.divIcon({
    className: "",
    html: `<div style="${PIN_BASE}width:36px;height:36px;background:${color};font-size:14px;"
      aria-label="Score ${label}">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(([lat, lon]) => [lat, lon])).pad(
      0.15,
    );
    const fit = () => {
      // The container can grow after Leaflet first measures it (flex layout),
      // and fitBounds against a stale size lands off-center.
      map.invalidateSize({ pan: false });
      map.fitBounds(bounds, { maxZoom: 10 });
    };
    fit();

    let last = map.getContainer().getBoundingClientRect();
    const observer = new ResizeObserver(() => {
      const next = map.getContainer().getBoundingClientRect();
      if (next.width === last.width && next.height === last.height) return;
      last = next;
      fit();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, points]);

  return null;
}

export function BoardMap({ mountains }: { mountains: MountainScoreRow[] }) {
  const points = useMemo(
    () => mountains.map((m) => [m.lat, m.lon] as [number, number]),
    [mountains],
  );

  return (
    <MapContainer
      center={[41.5, -74.5]}
      zoom={6}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {mountains.map((m) => {
        const offSeason = m.isIndoor ? null : seasonShortLabel(m.season);
        return (
          <Marker key={m.slug} position={[m.lat, m.lon]} icon={pinIcon(m)}>
            <Popup>
              <div className="min-w-[190px] space-y-1.5 text-sm">
                <div className="font-semibold">{m.name}</div>
                <div>
                  {offSeason
                    ? offSeason
                    : m.isIndoor || m.score == null
                      ? m.label
                      : `${m.score}/10 · ${m.label}`}
                </div>
                {!offSeason && m.reasons.length > 0 && (
                  <ul className="text-xs text-zinc-600">
                    {m.reasons.slice(0, 2).map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                )}
                <PassBadges passes={m.passes} />
                <div className="text-xs">
                  {m.ridersGoing} riders going this weekend
                </div>
                <Link
                  href={`/mountains/${m.slug}`}
                  className="inline-block pt-1 font-medium text-sky-700 underline"
                >
                  View mountain
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
