import {
  ApprovalBadge,
  EmptyState,
  LoadingGrid,
  MembershipBadge,
  ProviderStatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAdminApproveProvider,
  useAdminChangeMembership,
  useAdminChangeProviderStatus,
  useAdminRejectProvider,
  useAllProviders,
} from "@/hooks/useQueries";
import { toast } from "sonner";

export function ProvidersManagement() {
  const { data: providers, isLoading } = useAllProviders();
  const approve = useAdminApproveProvider();
  const reject = useAdminRejectProvider();
  const changeMembership = useAdminChangeMembership();
  const changeStatus = useAdminChangeProviderStatus();

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync(id);
      toast.success("Provider approved!");
    } catch {
      toast.error("Failed to approve.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject.mutateAsync(id);
      toast.success("Provider rejected.");
    } catch {
      toast.error("Failed to reject.");
    }
  };

  const handleMembership = async (id: string, type: string) => {
    try {
      await changeMembership.mutateAsync({ id, membershipType: type });
      toast.success(`Membership changed to ${type}!`);
    } catch {
      toast.error("Failed to change membership.");
    }
  };

  const handleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "inactive" : "active";
    try {
      await changeStatus.mutateAsync({ id, status: next });
      toast.success(`Provider ${next}!`);
    } catch {
      toast.error("Failed to change status.");
    }
  };

  if (isLoading) return <LoadingGrid count={5} />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Providers Management
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {providers?.length ?? 0} registered providers
        </p>
      </div>

      {!providers || providers.length === 0 ? (
        <EmptyState
          emoji="🔧"
          title="No providers yet"
          description="Providers will appear here after registration"
        />
      ) : (
        <div className="space-y-3">
          {providers.map((provider, i) => (
            <div
              key={provider.id}
              data-ocid={`providers.item.${i + 1}`}
              className="bg-card rounded-2xl border border-border p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                    🔧
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {provider.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {provider.serviceType} • {provider.mobile}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ApprovalBadge status={provider.approvalStatus} />
                  <ProviderStatusBadge status={provider.status} />
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-2 mb-3">
                <MembershipBadge type={provider.membershipType} />
                {provider.serviceAreas.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-2 py-0.5"
                  >
                    {a}
                  </span>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mb-3">
                ₹{provider.ratePerHour.toString()}/hr •{" "}
                {provider.experienceYears.toString()}yr exp •{" "}
                {provider.workingHours}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {provider.approvalStatus === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(provider.id)}
                      disabled={approve.isPending}
                      data-ocid={`providers.approve.button.${i + 1}`}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(provider.id)}
                      disabled={reject.isPending}
                      data-ocid={`providers.reject.button.${i + 1}`}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                    >
                      ✗ Reject
                    </Button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`providers.membership.button.${i + 1}`}
                      className="text-xs"
                    >
                      🏆 Membership
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {["gold", "silver", "bronze"].map((m) => (
                      <DropdownMenuItem
                        key={m}
                        onClick={() => handleMembership(provider.id, m)}
                        className="capitalize"
                      >
                        {m === "gold" ? "🏆" : m === "silver" ? "🥈" : "🥉"} {m}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatus(provider.id, provider.status)}
                  disabled={changeStatus.isPending}
                  data-ocid={`providers.status.toggle.${i + 1}`}
                  className="text-xs"
                >
                  {provider.status === "active" ? "⏸ Deactivate" : "▶ Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
