import type { ServiceProvider } from "@/backend.d";
import {
  ApprovalBadge,
  EmptyState,
  LoadingGrid,
  MembershipBadge,
  PageHeader,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_ORDER } from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import {
  useAssignProvider,
  useProvidersByServiceArea,
} from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ChooseProvider() {
  const { navigate, customer, params } = useAppContext();
  const workOrderId = params.workOrderId as string;
  const workLocation =
    (params.workLocation as string) || customer?.baseLocation || "";

  const { data: providers, isLoading } =
    useProvidersByServiceArea(workLocation);
  const assignProvider = useAssignProvider();

  const sorted = [...(providers ?? [])]
    .filter((p) => p.approvalStatus === "approved" && p.status === "active")
    .sort(
      (a, b) =>
        (MEMBERSHIP_ORDER[a.membershipType] ?? 2) -
        (MEMBERSHIP_ORDER[b.membershipType] ?? 2),
    );

  const handleBook = async (provider: ServiceProvider) => {
    if (!customer) return;
    try {
      await assignProvider.mutateAsync({
        workOrderId,
        providerId: provider.id,
        customerId: customer.id,
      });
      toast.success(`${provider.name} has been assigned to your request!`);
      navigate("customer-tracking", { workOrderId });
    } catch {
      toast.error("Failed to assign provider. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container">
        <PageHeader
          title="Choose a Provider"
          subtitle={`Available in ${workLocation}`}
          onBack={() => navigate("customer-home")}
        />

        {isLoading ? (
          <LoadingGrid count={4} />
        ) : sorted.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="No providers available"
            description={`No approved providers found in ${workLocation}. Try a different location.`}
            action={
              <Button
                variant="outline"
                onClick={() => navigate("customer-home")}
                data-ocid="choose.back.button"
              >
                Go Back
              </Button>
            }
          />
        ) : (
          <div className="p-4 space-y-3">
            {sorted.map((provider, i) => (
              <div
                key={provider.id}
                data-ocid={`providers.item.${i + 1}`}
                className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                      👷
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {provider.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {provider.serviceType}
                      </p>
                    </div>
                  </div>
                  <MembershipBadge type={provider.membershipType} />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-primary">
                      ₹{provider.ratePerHour.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">per hour</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-foreground">
                      {provider.experienceYears.toString()}y
                    </p>
                    <p className="text-xs text-muted-foreground">experience</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {provider.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2 py-0.5"
                    >
                      📍 {area}
                    </span>
                  ))}
                </div>

                {provider.workPreference.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {provider.workPreference.map((pref) => (
                      <span
                        key={pref}
                        className="text-xs bg-muted border border-border text-muted-foreground rounded-full px-2 py-0.5"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => handleBook(provider)}
                  disabled={assignProvider.isPending}
                  data-ocid={`providers.book.button.${i + 1}`}
                  className="w-full font-semibold"
                >
                  {assignProvider.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Booking...
                    </>
                  ) : (
                    "Book Now ✓"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
