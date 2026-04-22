/// <reference types="google.maps" />
import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search, Navigation, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { useT } from "@/i18n/I18nProvider";

interface Booth {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  placeId: string;
}

// Cache the script load promise across mounts
let mapsLoader: Promise<void> | null = null;

async function loadMaps(): Promise<void> {
  if (mapsLoader) return mapsLoader;
  mapsLoader = (async () => {
    const { data, error } = await supabase.functions.invoke("maps-config");
    if (error) throw new Error("Maps config failed");
    const apiKey = data?.apiKey;
    if (!apiKey) throw new Error("Maps key not configured");
    if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(s);
    });
  })();
  return mapsLoader;
}

function haversine(
  lat1: number, lng1: number, lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Booth() {
  const { t } = useT();
  useSEO({
    title: "Find My Booth — First Vote",
    description: "Locate your nearest polling booth with one tap.",
  });

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  // Load map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMaps();
        if (cancelled || !mapDivRef.current) return;
        const g = (window as unknown as { google: typeof google }).google;
        mapRef.current = new g.maps.Map(mapDivRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // India default
          zoom: 4,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1a2236" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a2236" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#9aa6b8" }] },
            { featureType: "water", stylers: [{ color: "#0c1322" }] },
            { featureType: "road", stylers: [{ color: "#2a3552" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
          ],
        });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const renderResults = useCallback(
    (origin: google.maps.LatLngLiteral, places: google.maps.places.PlaceResult[]) => {
      const map = mapRef.current;
      if (!map) return;
      const g = (window as unknown as { google: typeof google }).google;

      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // User marker (pulsing)
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      userMarkerRef.current = new g.maps.Marker({
        position: origin,
        map,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#FF6B35",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3,
        },
        title: "You",
      });

      const bounds = new g.maps.LatLngBounds();
      bounds.extend(origin);

      const list: Booth[] = places
        .filter((p) => p.geometry?.location)
        .map((p) => {
          const lat = p.geometry!.location!.lat();
          const lng = p.geometry!.location!.lng();
          return {
            name: p.name ?? "Polling station",
            address: p.vicinity ?? p.formatted_address ?? "",
            lat,
            lng,
            distance: haversine(origin.lat, origin.lng, lat, lng),
            placeId: p.place_id ?? `${lat},${lng}`,
          };
        })
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

      list.forEach((b, i) => {
        const marker = new g.maps.Marker({
          position: { lat: b.lat, lng: b.lng },
          map,
          label: { text: `${i + 1}`, color: "#fff", fontWeight: "700" },
        });
        markersRef.current.push(marker);
        bounds.extend({ lat: b.lat, lng: b.lng });
      });

      if (list.length > 0) map.fitBounds(bounds, 60);
      else map.setCenter(origin), map.setZoom(13);

      setBooths(list);
    },
    [],
  );

  const searchNear = useCallback(
    async (loc: google.maps.LatLngLiteral) => {
      const map = mapRef.current;
      if (!map) return;
      setLoading(true);
      setError(null);
      try {
        const g = (window as unknown as { google: typeof google }).google;
        const svc = new g.maps.places.PlacesService(map);
        const places = await new Promise<google.maps.places.PlaceResult[]>(
          (resolve) => {
            svc.nearbySearch(
              {
                location: loc,
                radius: 5000,
                keyword: "polling station OR voting booth OR election center",
              },
              (res, status) => {
                if (status === g.maps.places.PlacesServiceStatus.OK && res) {
                  resolve(res);
                } else {
                  // Fallback: government offices
                  svc.nearbySearch(
                    { location: loc, radius: 5000, keyword: "government office" },
                    (res2) => resolve(res2 ?? []),
                  );
                }
              },
            );
          },
        );
        renderResults(loc, places);

        // Cache search
        supabase.from("booth_searches").insert({
          latitude: loc.lat,
          longitude: loc.lng,
          results: places.slice(0, 20).map((p) => ({
            name: p.name,
            place_id: p.place_id,
          })),
        }).then(({ error }) => { if (error) console.warn(error); });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [renderResults],
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError(t("Geolocation not supported. Please search manually."));
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(loc);
        searchNear(loc);
      },
      () => {
        setLoading(false);
        setError(t("Location denied. Please type your address below."));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const searchAddress = async () => {
    if (!query.trim()) return;
    try {
      await loadMaps();
      const g = (window as unknown as { google: typeof google }).google;
      const geocoder = new g.maps.Geocoder();
      setLoading(true);
      const { results } = await geocoder.geocode({ address: query });
      if (results && results[0]) {
        const loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        setOrigin(loc);
        searchNear(loc);
      } else {
        setError(t("No results for that address."));
        setLoading(false);
      }
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
          {t("Find Your")} <span className="gradient-text">{t("Polling Booth")}</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("Tap to share your location, or type any address / pincode.")}
        </p>
      </div>

      <div className="glass-strong rounded-3xl p-3 md:p-4 mb-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={useMyLocation}
          disabled={loading}
          className="btn-3d ripple-host !min-h-[48px] sm:flex-shrink-0"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
          {t("Use my location")}
        </button>
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchAddress()}
              placeholder={t("Address, city or pincode")}
              className="w-full glass rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button onClick={searchAddress} className="btn-ghost-3d !py-2 !min-h-[48px]">
            {t("Search")}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass rounded-2xl p-4 mb-4 flex items-start gap-3 border border-destructive/30">
          <AlertCircle className="text-destructive shrink-0 mt-0.5" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div
          ref={mapDivRef}
          className="glass rounded-3xl h-[420px] md:h-[560px] overflow-hidden"
          aria-label="Map"
        />
        <div className="glass rounded-3xl p-4 max-h-[560px] overflow-y-auto">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-accent" />
            {t("Nearby")} ({booths.length})
          </h2>
          {booths.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("Share your location to see polling stations near you.")}
            </p>
          ) : (
            <ul className="space-y-3">
              {booths.map((b, i) => (
                <li key={b.placeId} className="glass rounded-2xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-accent text-accent-foreground text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-semibold text-sm leading-tight truncate">
                        {b.name}
                      </p>
                    </div>
                    {b.distance != null && (
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                        {b.distance < 1
                          ? `${Math.round(b.distance * 1000)} m`
                          : `${b.distance.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 ml-8">
                    {b.address}
                  </p>
                  <a
                    href={
                      origin
                        ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${b.lat},${b.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-2 ml-8"
                  >
                    {t("Get directions")} →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
