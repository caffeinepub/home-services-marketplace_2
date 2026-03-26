import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";

// Fix default Leaflet marker icon (known issue with bundlers)
const iconProto = L.Icon.Default.prototype as unknown as Record<
  string,
  unknown
>;
// biome-ignore lint/complexity/useLiteralKeys: leaflet internal property
// biome-ignore lint/performance/noDelete: required for leaflet icon fix
iconProto["_getIconUrl"] = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface PickupLocationPickerProps {
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

const DEFAULT_LAT = 13.0266;
const DEFAULT_LNG = 77.6468;

export function PickupLocationPicker({
  onConfirm,
  onClose,
}: PickupLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentLat, setCurrentLat] = useState(DEFAULT_LAT);
  const [currentLng, setCurrentLng] = useState(DEFAULT_LNG);

  const reverseGeocode = useCallback(async (la: number, lo: number) => {
    setCurrentLat(la);
    setCurrentLng(lo);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      setCurrentAddress(
        data.display_name ?? `${la.toFixed(5)}, ${lo.toFixed(5)}`,
      );
    } catch {
      setCurrentAddress(`${la.toFixed(5)}, ${lo.toFixed(5)}`);
    }
  }, []);

  const moveTo = useCallback(
    (la: number, lo: number) => {
      if (leafletMap.current && markerRef.current) {
        leafletMap.current.setView([la, lo], 16);
        markerRef.current.setLatLng([la, lo]);
      }
      reverseGeocode(la, lo);
    },
    [reverseGeocode],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: map init runs once on mount
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [DEFAULT_LAT, DEFAULT_LNG],
      15,
    );
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", (e) => {
      const pos = (e.target as L.Marker).getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        moveTo(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 },
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in`,
        { headers: { "Accept-Language": "en" } },
      );
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (result: NominatimResult) => {
    moveTo(Number(result.lat), Number(result.lon));
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",")[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-semibold text-foreground">
            Choose Pickup Location
          </h2>
          <p className="text-xs text-muted-foreground">
            Drag pin or tap to select
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 bg-card border-b border-border space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for a location..."
              className="pl-9"
              data-ocid="pickup.search_input"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSearch}
            disabled={searching}
            data-ocid="pickup.button"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="bg-popover border border-border rounded-lg overflow-hidden shadow-md max-h-40 overflow-y-auto">
            {searchResults.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 border-b border-border last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="line-clamp-1">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Use current location */}
        <Button
          variant="outline"
          size="sm"
          onClick={useCurrentLocation}
          disabled={locating}
          className="w-full h-9 text-primary border-primary/30 hover:bg-primary/5"
          data-ocid="pickup.primary_button"
        >
          {locating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 mr-2" />
          )}
          Use Current Location
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 bg-card border-t border-border space-y-2">
        {currentAddress && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground line-clamp-2">{currentAddress}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
              </p>
            </div>
          </div>
        )}
        <Button
          onClick={() =>
            currentAddress && onConfirm(currentAddress, currentLat, currentLng)
          }
          disabled={!currentAddress}
          className="w-full h-12 text-base font-semibold"
          data-ocid="pickup.confirm_button"
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
