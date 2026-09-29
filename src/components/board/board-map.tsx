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
import { scoreColor } from "@/lib/snow/format";
import type { MountainScoreRow } from "@/lib/snow/get-scores";
import "leaflet/dist/leaflet.css";

function pinIcon(score: number | null, isIndoor: boolean) {
  const color = scoreColor(score, isIndoor);
  const label = isIndoor ? "⌂" : score == null ? "–" : String(score);
  const html = `<div style="
    width:36px;height:36px;border-radius:9999px;
    background:${color};color:#0a0a0a;
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:14px;border:2px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,.35);
  " aria-label="Score ${label}">${label}</div>`;
  return L.divIcon({
    className: "",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(([lat, lon]) => [lat, lon]));
    map.fitBounds(bounds.pad(0.15));
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
      {mountains.map((m) => (
        <Marker
          key={m.slug}
          position={[m.lat, m.lon]}
          icon={pinIcon(m.score, m.isIndoor)}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1 text-sm">
              <div className="font-semibold">{m.name}</div>
              <div>
                {m.isIndoor || m.score == null
                  ? m.label
                  : `${m.score}/10 · ${m.label}`}
              </div>
              <ul className="text-xs text-zinc-600">
                {m.reasons.slice(0, 2).map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
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
      ))}
    </MapContainer>
  );
}
