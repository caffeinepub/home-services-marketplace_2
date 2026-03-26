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
import {
  LOCATIONS,
  SERVICE_TYPES,
  WORK_DAYS,
  WORK_PREFERENCES,
} from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import { useActor } from "@/hooks/useActor";
import { useRegisterCustomer, useRegisterProvider } from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type Role = "customer" | "provider";

export function RegisterPage({ onSuccess }: { onSuccess: () => void }) {
  const { navigate, setCustomer, setProvider } = useAppContext();
  const { actor } = useActor();
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<"role" | "form">("role");

  const [custName, setCustName] = useState("");
  const [custMobile, setCustMobile] = useState("");
  const [custLocation, setCustLocation] = useState("");

  const [provName, setProvName] = useState("");
  const [provMobile, setProvMobile] = useState("");
  const [provServiceType, setProvServiceType] = useState("");
  const [provWorkingDays, setProvWorkingDays] = useState<string[]>([]);
  const [provWorkingHours, setProvWorkingHours] = useState("");
  const [provExperience, setProvExperience] = useState("");
  const [provAreas, setProvAreas] = useState<string[]>([]);
  const [provRate, setProvRate] = useState("");
  const [provPreferences, setProvPreferences] = useState<string[]>([]);

  const registerCustomer = useRegisterCustomer();
  const registerProvider = useRegisterProvider();

  const toggleArrayItem = (
    arr: string[],
    setArr: (v: string[]) => void,
    item: string,
  ) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const handleSubmit = async () => {
    try {
      if (role === "customer") {
        if (!custName || !custMobile || !custLocation) {
          toast.error("Please fill all fields");
          return;
        }
        await registerCustomer.mutateAsync({
          name: custName,
          mobile: custMobile,
          baseLocation: custLocation,
        });
        // Fetch fresh profile and navigate directly
        try {
          if (actor) {
            const freshProfile = await actor.getMyProfile();
            if (freshProfile && freshProfile.__kind__ === "customer") {
              setCustomer(freshProfile.customer);
            }
          }
        } catch {
          // ignore profile fetch error, dashboard will handle it
        }
        toast.success("Registration successful! Welcome aboard.");
        navigate("customer-home");
        onSuccess();
      } else if (role === "provider") {
        if (
          !provName ||
          !provMobile ||
          !provServiceType ||
          !provWorkingHours ||
          !provExperience ||
          !provRate
        ) {
          toast.error("Please fill all required fields");
          return;
        }
        await registerProvider.mutateAsync({
          name: provName,
          mobile: provMobile,
          serviceType: provServiceType,
          workingDays: provWorkingDays.join(", "),
          workingHours: provWorkingHours,
          experienceYears: BigInt(Number.parseInt(provExperience) || 0),
          serviceAreas: provAreas,
          ratePerHour: BigInt(Number.parseInt(provRate) || 0),
          workPreference: provPreferences,
        });
        // Fetch fresh profile and navigate directly
        try {
          if (actor) {
            const freshProfile = await actor.getMyProfile();
            if (freshProfile && freshProfile.__kind__ === "provider") {
              setProvider(freshProfile.provider);
            }
          }
        } catch {
          // ignore profile fetch error, dashboard will handle it
        }
        toast.success("Registration successful! Awaiting admin approval.");
        navigate("provider-dashboard");
        onSuccess();
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const isPending = registerCustomer.isPending || registerProvider.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container">
        <div className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
          <h1 className="font-heading text-2xl font-bold">Create Account</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Join HomeServe today
          </p>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-heading text-lg font-semibold text-foreground mb-2">
                  I want to...
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Choose your account type
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      id: "customer" as Role,
                      emoji: "🏠",
                      title: "Book Services",
                      desc: "Find and hire professionals",
                    },
                    {
                      id: "provider" as Role,
                      emoji: "🔧",
                      title: "Provide Services",
                      desc: "Earn by offering services",
                    },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        setStep("form");
                      }}
                      data-ocid={`register.${r.id}.card`}
                      className="bg-card border-2 border-border hover:border-primary rounded-2xl p-6 text-left transition-all hover:shadow-md"
                    >
                      <div className="text-4xl mb-3">{r.emoji}</div>
                      <h3 className="font-heading font-semibold text-foreground">
                        {r.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "form" && role === "customer" && (
              <motion.div
                key="customer-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-primary text-sm font-medium flex items-center gap-1"
                >
                  ← Back
                </button>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Customer Details
                </h2>

                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Rahul Sharma"
                    data-ocid="register.name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Mobile Number</Label>
                  <Input
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="9876543210"
                    data-ocid="register.mobile.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Address / Pickup Location</Label>
                  <Select value={custLocation} onValueChange={setCustLocation}>
                    <SelectTrigger data-ocid="register.location.select">
                      <SelectValue placeholder="Select your area" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  data-ocid="register.submit_button"
                  className="w-full h-11 font-semibold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Registering...
                    </>
                  ) : (
                    "Create Customer Account"
                  )}
                </Button>
              </motion.div>
            )}

            {step === "form" && role === "provider" && (
              <motion.div
                key="provider-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-primary text-sm font-medium flex items-center gap-1"
                >
                  ← Back
                </button>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Provider Details
                </h2>

                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input
                    value={provName}
                    onChange={(e) => setProvName(e.target.value)}
                    placeholder="Ravi Kumar"
                    data-ocid="register.name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Mobile Number</Label>
                  <Input
                    value={provMobile}
                    onChange={(e) => setProvMobile(e.target.value)}
                    placeholder="9876543210"
                    data-ocid="register.mobile.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Service Type</Label>
                  <Select
                    value={provServiceType}
                    onValueChange={setProvServiceType}
                  >
                    <SelectTrigger data-ocid="register.service_type.select">
                      <SelectValue placeholder="Select service type" />
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

                <div className="space-y-1">
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {WORK_DAYS.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() =>
                          toggleArrayItem(
                            provWorkingDays,
                            setProvWorkingDays,
                            d,
                          )
                        }
                        data-ocid="register.day.toggle"
                        className={[
                          "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                          provWorkingDays.includes(d)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary",
                        ].join(" ")}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Working Hours (e.g. 9AM-6PM)</Label>
                  <Input
                    value={provWorkingHours}
                    onChange={(e) => setProvWorkingHours(e.target.value)}
                    placeholder="9AM-6PM"
                    data-ocid="register.hours.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Experience (Years)</Label>
                  <Input
                    value={provExperience}
                    onChange={(e) => setProvExperience(e.target.value)}
                    placeholder="5"
                    type="number"
                    data-ocid="register.experience.input"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Service Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() =>
                          toggleArrayItem(provAreas, setProvAreas, loc)
                        }
                        data-ocid="register.area.toggle"
                        className={[
                          "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                          provAreas.includes(loc)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary",
                        ].join(" ")}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Rate Per Hour (₹)</Label>
                  <Input
                    value={provRate}
                    onChange={(e) => setProvRate(e.target.value)}
                    placeholder="500"
                    type="number"
                    data-ocid="register.rate.input"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Work Preference</Label>
                  <div className="flex flex-wrap gap-2">
                    {WORK_PREFERENCES.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() =>
                          toggleArrayItem(
                            provPreferences,
                            setProvPreferences,
                            p,
                          )
                        }
                        data-ocid="register.preference.toggle"
                        className={[
                          "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                          provPreferences.includes(p)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  data-ocid="register.submit_button"
                  className="w-full h-11 font-semibold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Registering...
                    </>
                  ) : (
                    "Create Provider Account"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
