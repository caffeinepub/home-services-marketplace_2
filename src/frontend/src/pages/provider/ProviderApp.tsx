import type { WorkOrder } from "@/backend.d";
import { BottomNav } from "@/components/BottomNav";
import {
  ApprovalBadge,
  EmptyState,
  LoadingGrid,
  MembershipBadge,
  StatCard,
  StatusChip,
} from "@/components/shared";
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
import { LOCATIONS, SERVICE_TYPES, WORK_PREFERENCES } from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import {
  useProviderEarnings,
  useProviderWorkOrders,
  useUpdateProvider,
  useUpdateWorkOrderStatus,
} from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊", activeIcon: "📊" },
  { id: "jobs", label: "Jobs", icon: "📥", activeIcon: "📥" },
  { id: "active", label: "Active", icon: "⚡", activeIcon: "⚡" },
  { id: "completed", label: "Done", icon: "✅", activeIcon: "✅" },
  { id: "profile", label: "Profile", icon: "👤", activeIcon: "👤" },
];

function ProviderDashboard() {
  const { provider } = useAppContext();
  const { data: orders, isLoading } = useProviderWorkOrders(provider?.id);
  const { data: earnings } = useProviderEarnings(provider?.id);

  const newRequests =
    orders?.filter((o) => o.status === "requested").length ?? 0;
  const accepted = orders?.filter((o) => o.status === "accepted").length ?? 0;
  const completed = orders?.filter((o) => o.status === "completed").length ?? 0;

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center text-2xl">
            🔧
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">{provider?.name}</h1>
            <p className="text-primary-foreground/70 text-sm">
              {provider?.serviceType}
            </p>
          </div>
          <div className="ml-auto">
            {provider && <MembershipBadge type={provider.membershipType} />}
          </div>
        </div>
        {provider?.approvalStatus !== "approved" && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl p-3">
            <p className="text-yellow-100 text-sm font-medium">
              ⏳ Your account is awaiting admin approval. You'll be able to
              accept jobs once approved.
            </p>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            label="New Requests"
            value={isLoading ? "..." : newRequests}
            icon="📥"
            color="blue"
          />
          <StatCard
            label="Accepted Jobs"
            value={isLoading ? "..." : accepted}
            icon="✅"
            color="indigo"
          />
          <StatCard
            label="Completed Jobs"
            value={isLoading ? "..." : completed}
            icon="🎉"
            color="green"
          />
          <StatCard
            label="Total Earnings"
            value={earnings ? `₹${earnings.totalEarnings.toString()}` : "₹0"}
            icon="💰"
            color="amber"
          />
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
          <h3 className="font-heading font-semibold text-foreground mb-2">
            Profile Summary
          </h3>
          {[
            {
              label: "Service Areas",
              value: provider?.serviceAreas.join(", "),
            },
            { label: "Working Hours", value: provider?.workingHours },
            {
              label: "Rate/Hour",
              value: `₹${provider?.ratePerHour.toString()}`,
            },
            {
              label: "Experience",
              value: `${provider?.experienceYears.toString()} years`,
            },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobRequestsPage() {
  const { provider } = useAppContext();
  const {
    data: orders,
    isLoading,
    refetch,
  } = useProviderWorkOrders(provider?.id);
  const updateStatus = useUpdateWorkOrderStatus();

  const requests = orders?.filter((o) => o.status === "requested") ?? [];

  const handleAction = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({
        workOrderId: orderId,
        status,
        providerId: provider?.id,
      });
      toast.success(status === "accepted" ? "Job accepted!" : "Job rejected");
      refetch();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  if (isLoading) return <LoadingGrid />;
  if (requests.length === 0) {
    return (
      <div className="pb-20">
        <EmptyState
          emoji="📥"
          title="No new requests"
          description="New job requests will appear here"
        />
      </div>
    );
  }

  return (
    <div className="pb-20 p-4">
      <h2 className="font-heading font-semibold text-foreground mb-4">
        New Requests ({requests.length})
      </h2>
      <div className="space-y-3">
        {requests.map((order, i) => (
          <JobCard
            key={order.id}
            order={order}
            index={i + 1}
            actions={
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(order.id, "cancelled")}
                  disabled={updateStatus.isPending}
                  data-ocid={`jobs.reject.button.${i + 1}`}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(order.id, "accepted")}
                  disabled={updateStatus.isPending}
                  data-ocid={`jobs.accept.button.${i + 1}`}
                  className="flex-1"
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Accept"
                  )}
                </Button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

function ActiveJobsPage() {
  const { provider } = useAppContext();
  const {
    data: orders,
    isLoading,
    refetch,
  } = useProviderWorkOrders(provider?.id);
  const updateStatus = useUpdateWorkOrderStatus();

  const active =
    orders?.filter(
      (o) => o.status === "accepted" || o.status === "inProgress",
    ) ?? [];

  const handleAction = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({
        workOrderId: orderId,
        status,
        providerId: provider?.id,
      });
      toast.success(
        status === "inProgress" ? "Job started!" : "Job completed!",
      );
      refetch();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  if (isLoading) return <LoadingGrid />;
  if (active.length === 0) {
    return (
      <div className="pb-20">
        <EmptyState
          emoji="⚡"
          title="No active jobs"
          description="Accepted jobs will appear here"
        />
      </div>
    );
  }

  return (
    <div className="pb-20 p-4">
      <h2 className="font-heading font-semibold text-foreground mb-4">
        Active Jobs ({active.length})
      </h2>
      <div className="space-y-3">
        {active.map((order, i) => (
          <JobCard
            key={order.id}
            order={order}
            index={i + 1}
            actions={
              <div className="flex gap-2 mt-3">
                {order.status === "accepted" && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(order.id, "inProgress")}
                    disabled={updateStatus.isPending}
                    data-ocid={`active.start.button.${i + 1}`}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Start Job ▶
                  </Button>
                )}
                {order.status === "inProgress" && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(order.id, "completed")}
                    disabled={updateStatus.isPending}
                    data-ocid={`active.complete.button.${i + 1}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updateStatus.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Mark Complete ✓"
                    )}
                  </Button>
                )}
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

function CompletedJobsPage() {
  const { provider } = useAppContext();
  const { data: orders, isLoading } = useProviderWorkOrders(provider?.id);
  const { data: earnings } = useProviderEarnings(provider?.id);

  const completed = orders?.filter((o) => o.status === "completed") ?? [];

  if (isLoading) return <LoadingGrid />;

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground p-4">
        <p className="text-primary-foreground/70 text-sm">Total Earnings</p>
        <p className="font-heading text-3xl font-bold">
          ₹{earnings?.totalEarnings.toString() ?? "0"}
        </p>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {completed.length} jobs completed
        </p>
      </div>

      <div className="p-4">
        {completed.length === 0 ? (
          <EmptyState
            emoji="✅"
            title="No completed jobs"
            description="Completed jobs will show your earnings"
          />
        ) : (
          <div className="space-y-3">
            {completed.map((order, i) => (
              <div
                key={order.id}
                data-ocid={`completed.item.${i + 1}`}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.serviceType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.workLocation}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(
                        Number(order.dateTimeRequested) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusChip status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderProfilePage() {
  const { provider } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(provider?.name ?? "");
  const [mobile, setMobile] = useState(provider?.mobile ?? "");
  const [serviceType, setServiceType] = useState(provider?.serviceType ?? "");
  const [workingHours, setWorkingHours] = useState(
    provider?.workingHours ?? "",
  );
  const [ratePerHour, setRatePerHour] = useState(
    provider?.ratePerHour.toString() ?? "",
  );
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    provider?.serviceAreas ?? [],
  );
  const [workPreference, setWorkPreference] = useState<string[]>(
    provider?.workPreference ?? [],
  );

  const updateProvider = useUpdateProvider();

  const toggleItem = (
    arr: string[],
    setArr: (v: string[]) => void,
    item: string,
  ) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const handleSave = async () => {
    if (!provider) return;
    try {
      await updateProvider.mutateAsync({
        providerId: provider.id,
        name,
        mobile,
        serviceType,
        workingDays: provider.workingDays,
        workingHours,
        experienceYears: provider.experienceYears,
        serviceAreas,
        ratePerHour: BigInt(Number.parseInt(ratePerHour) || 0),
        workPreference,
      });
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  if (!provider) return null;

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center text-3xl">
              🔧
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">
                {provider.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <ApprovalBadge status={provider.approvalStatus} />
                <MembershipBadge type={provider.membershipType} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            data-ocid="profile.edit.button"
            className="bg-primary-foreground/20 rounded-xl px-3 py-1.5 text-sm font-medium"
          >
            {editing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {editing ? (
          <>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-ocid="profile.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Mobile</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                data-ocid="profile.mobile.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger data-ocid="profile.service_type.select">
                  <SelectValue />
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
              <Label>Working Hours</Label>
              <Input
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                data-ocid="profile.hours.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Rate Per Hour (₹)</Label>
              <Input
                value={ratePerHour}
                onChange={(e) => setRatePerHour(e.target.value)}
                type="number"
                data-ocid="profile.rate.input"
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
                      toggleItem(serviceAreas, setServiceAreas, loc)
                    }
                    data-ocid="profile.area.toggle"
                    className={[
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                      serviceAreas.includes(loc)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border",
                    ].join(" ")}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Work Preference</Label>
              <div className="flex flex-wrap gap-2">
                {WORK_PREFERENCES.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() =>
                      toggleItem(workPreference, setWorkPreference, p)
                    }
                    data-ocid="profile.pref.toggle"
                    className={[
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                      workPreference.includes(p)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={updateProvider.isPending}
              data-ocid="profile.save_button"
              className="w-full font-semibold"
            >
              {updateProvider.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        ) : (
          <>
            {[
              { label: "Mobile", value: provider.mobile },
              { label: "Service Type", value: provider.serviceType },
              { label: "Working Days", value: provider.workingDays },
              { label: "Working Hours", value: provider.workingHours },
              {
                label: "Experience",
                value: `${provider.experienceYears.toString()} years`,
              },
              {
                label: "Rate/Hour",
                value: `₹${provider.ratePerHour.toString()}`,
              },
              {
                label: "Service Areas",
                value: provider.serviceAreas.join(", "),
              },
              {
                label: "Work Preference",
                value: provider.workPreference.join(", "),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card rounded-xl border border-border p-4"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {item.label}
                </p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function JobCard({
  order,
  index,
  actions,
}: { order: WorkOrder; index: number; actions?: React.ReactNode }) {
  return (
    <div
      data-ocid={`jobs.item.${index}`}
      className="bg-card rounded-2xl border border-border p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-foreground">{order.serviceType}</p>
          <p className="text-xs text-muted-foreground">{order.workLocation}</p>
        </div>
        <StatusChip status={order.status} />
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        🔧 {order.serviceRequest}
      </p>
      <p className="text-xs text-foreground/80 line-clamp-2">
        {order.description}
      </p>
      {actions}
    </div>
  );
}

export function ProviderApp() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <ProviderDashboard />;
      case "jobs":
        return <JobRequestsPage />;
      case "active":
        return <ActiveJobsPage />;
      case "completed":
        return <CompletedJobsPage />;
      case "profile":
        return <ProviderProfilePage />;
      default:
        return <ProviderDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container relative min-h-screen">
        {renderTab()}
        <BottomNav
          items={NAV_ITEMS}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </div>
  );
}
