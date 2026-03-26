import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_CATEGORIES, SERVICE_TYPES } from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import { useCreateWorkOrder } from "@/hooks/useQueries";
import { Loader2, MapPin, Pencil, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PickupLocationPicker } from "./PickupLocationPicker";

interface NominatimSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function CreateServiceRequest() {
  const { navigate, customer, params } = useAppContext();
  const categoryId = params.categoryId as string | undefined;
  const defaultCat = SERVICE_CATEGORIES.find((c) => c.id === categoryId);

  const [description, setDescription] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    NominatimSuggestion[]
  >([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);

  const [serviceType, setServiceType] = useState("");
  const [serviceRequest, setServiceRequest] = useState(
    defaultCat ? defaultCat.services[0] : "",
  );
  const [showMap, setShowMap] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const createWorkOrder = useCreateWorkOrder();

  // Auto-suggest on address input
  useEffect(() => {
    if (serviceAddress.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAddressSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(serviceAddress)}&format=json&limit=5&countrycodes=in`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimSuggestion[] = await res.json();
        setAddressSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        // ignore
      } finally {
        setAddressSearching(false);
      }
    }, 400);
  }, [serviceAddress]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = async () => {
    if (!customer) {
      toast.error("Not logged in");
      return;
    }
    if (!serviceType || !serviceRequest || !description) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!serviceAddress.trim()) {
      toast.error("Please enter a Service Address");
      return;
    }
    if (!pickupLocation || pickupLat === null || pickupLng === null) {
      toast.error("Please select a Pickup Location on the map");
      return;
    }
    try {
      const fullDescription = `${description}\n\nPickup Location: ${pickupLocation} (${pickupLat.toFixed(6)}, ${pickupLng.toFixed(6)})`;
      const workOrderId = await createWorkOrder.mutateAsync({
        customerId: customer.id,
        description: fullDescription,
        workLocation: `ServiceAddress: ${serviceAddress} | PickupLocation: ${pickupLocation} | Coords: ${pickupLat.toFixed(6)},${pickupLng.toFixed(6)}`,
        serviceRequest,
        serviceType,
      });
      toast.success("Service request created!");
      navigate("customer-choose-provider", {
        workOrderId,
        workLocation: serviceAddress,
      });
    } catch {
      toast.error("Failed to create request. Try again.");
    }
  };

  const selectedCat = SERVICE_CATEGORIES.find((c) =>
    c.services.includes(serviceRequest),
  );

  return (
    <>
      {showMap && (
        <PickupLocationPicker
          onConfirm={(address, lat, lng) => {
            setPickupLocation(address);
            setPickupLat(lat);
            setPickupLng(lng);
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      <div className="min-h-screen bg-background">
        <div className="mobile-container">
          <PageHeader
            title="New Service Request"
            subtitle="Describe what you need"
            onBack={() => navigate("customer-home")}
          />

          <div className="p-4 space-y-5">
            {/* Service Category */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                SERVICE CATEGORY
              </Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setServiceRequest(cat.services[0])}
                    data-ocid="create.category.toggle"
                    className={[
                      "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                      selectedCat?.id === cat.id
                        ? `${cat.bgClass} ${cat.borderClass} text-foreground`
                        : "bg-card border-border text-muted-foreground hover:border-primary",
                    ].join(" ")}
                  >
                    <span>{cat.emoji}</span> {cat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type */}
            <div className="space-y-1">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger data-ocid="create.service_type.select">
                  <SelectValue placeholder="e.g. Electrician" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specific Service */}
            {selectedCat && (
              <div className="space-y-1">
                <Label>Specific Service</Label>
                <Select
                  value={serviceRequest}
                  onValueChange={setServiceRequest}
                >
                  <SelectTrigger data-ocid="create.service_request.select">
                    <SelectValue placeholder="Select specific service" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCat.services.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ─── Service Address (Manual Text Entry + Suggestions) ─── */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm text-foreground">
                Service Address
              </Label>
              <p className="text-xs text-muted-foreground -mt-1">
                Type your full address — street, area, or landmark
              </p>
              <div className="relative" ref={suggestionsRef}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  {addressSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                  )}
                  {!addressSearching && serviceAddress.length >= 3 && (
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  <Input
                    value={serviceAddress}
                    onChange={(e) => {
                      setServiceAddress(e.target.value);
                      if (e.target.value.length >= 3) setShowSuggestions(true);
                    }}
                    onFocus={() =>
                      addressSuggestions.length > 0 && setShowSuggestions(true)
                    }
                    placeholder="Enter Service Address (e.g., Street, Area, Landmark)"
                    className="pl-9 pr-9"
                    data-ocid="create.service_address.input"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                    {addressSuggestions.map((s) => (
                      <button
                        key={s.place_id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setServiceAddress(s.display_name);
                          setShowSuggestions(false);
                          setAddressSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-start gap-2 border-b border-border last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{s.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Pickup Location (Map-based) ─── */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm text-foreground">
                Pickup Location
              </Label>
              <p className="text-xs text-muted-foreground -mt-1">
                Pin your exact pickup spot on the map
              </p>

              {pickupLocation ? (
                <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-primary/30 bg-primary/5">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                      {pickupLocation}
                    </p>
                    {pickupLat !== null && pickupLng !== null && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pickupLat.toFixed(5)}, {pickupLng.toFixed(5)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    data-ocid="create.edit_button"
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline flex-shrink-0"
                  >
                    <Pencil className="w-3 h-3" />
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  data-ocid="create.open_modal_button"
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      Select Location on Map
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tap to open map & pin exact location
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail. E.g. The main switch trips every time I turn on the AC..."
                rows={4}
                data-ocid="create.description.textarea"
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createWorkOrder.isPending}
              data-ocid="create.submit_button"
              className="w-full h-12 text-base font-semibold"
            >
              {createWorkOrder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Find Providers →"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
