import {
  EmptyState,
  LoadingGrid,
  MembershipBadge,
  StatusChip,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminChangeMembership,
  useAllCustomers,
  useAllPayments,
  useAllProviders,
  useAllWorkOrders,
} from "@/hooks/useQueries";
import { toast } from "sonner";

function CustomersPage() {
  const { data: customers, isLoading } = useAllCustomers();
  if (isLoading) return <LoadingGrid />;
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Customers
        </h2>
        <p className="text-muted-foreground text-sm">
          {customers?.length ?? 0} registered customers
        </p>
      </div>
      {!customers || customers.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="No customers yet"
          description="Customers will appear after registration"
        />
      ) : (
        <div className="space-y-2">
          {customers.map((c, i) => (
            <div
              key={c.id}
              data-ocid={`customers.item.${i + 1}`}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.mobile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    📍 {c.baseLocation}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {c.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkOrdersPage() {
  const { data: orders, isLoading } = useAllWorkOrders();
  const statuses = [
    "all",
    "requested",
    "accepted",
    "inProgress",
    "completed",
    "cancelled",
  ];

  if (isLoading) return <LoadingGrid />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Work Orders
        </h2>
        <p className="text-muted-foreground text-sm">
          {orders?.length ?? 0} total orders
        </p>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="w-full overflow-x-auto flex gap-1 h-auto p-1">
          {statuses.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              data-ocid={`orders.${s}.tab`}
              className="capitalize text-xs"
            >
              {s === "all"
                ? "All"
                : s === "inProgress"
                  ? "In Progress"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        {statuses.map((s) => {
          const filtered =
            s === "all"
              ? (orders ?? [])
              : (orders ?? []).filter((o) => o.status === s);
          return (
            <TabsContent key={s} value={s} className="mt-4">
              {filtered.length === 0 ? (
                <EmptyState
                  emoji="📋"
                  title="No orders"
                  description={`No ${s === "all" ? "" : s} orders found`}
                />
              ) : (
                <div className="space-y-2">
                  {filtered.map((order, i) => (
                    <div
                      key={order.id}
                      data-ocid={`orders.item.${i + 1}`}
                      className="bg-card rounded-xl border border-border p-3"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {order.serviceType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.workLocation}
                          </p>
                        </div>
                        <StatusChip status={order.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Order: {order.id.slice(0, 8)}...</span>
                        <span>
                          {new Date(
                            Number(order.dateTimeRequested) / 1_000_000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function PaymentsPage() {
  const { data: payments, isLoading } = useAllPayments();
  const payStatuses = ["all", "pending", "paid", "failed"];

  if (isLoading) return <LoadingGrid />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Payments
        </h2>
        <p className="text-muted-foreground text-sm">
          {payments?.length ?? 0} transactions
        </p>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="w-full flex gap-1 h-auto p-1">
          {payStatuses.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              data-ocid={`payments.${s}.tab`}
              className="capitalize text-xs flex-1"
            >
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
        {payStatuses.map((s) => {
          const filtered =
            s === "all"
              ? (payments ?? [])
              : (payments ?? []).filter((p) => p.paymentStatus === s);
          return (
            <TabsContent key={s} value={s} className="mt-4">
              {filtered.length === 0 ? (
                <EmptyState
                  emoji="💳"
                  title="No payments"
                  description={`No ${s} payments found`}
                />
              ) : (
                <div className="space-y-2">
                  {filtered.map((pay, i) => (
                    <div
                      key={pay.id}
                      data-ocid={`payments.item.${i + 1}`}
                      className="bg-card rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            ₹{pay.amount.toString()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {pay.paymentMode}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            pay.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : pay.paymentStatus === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {pay.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Order: {pay.workOrderId.slice(0, 8)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function MembershipManagement() {
  const { data: providers, isLoading } = useAllProviders();
  const changeMembership = useAdminChangeMembership();
  const tiers = ["gold", "silver", "bronze"];

  const handleChange = async (id: string, type: string) => {
    try {
      await changeMembership.mutateAsync({ id, membershipType: type });
      toast.success("Membership updated!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  if (isLoading) return <LoadingGrid />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Membership Management
        </h2>
        <p className="text-muted-foreground text-sm">
          Assign and manage provider membership tiers
        </p>
      </div>
      {tiers.map((tier) => {
        const tierProviders = (providers ?? []).filter(
          (p) => p.membershipType === tier,
        );
        return (
          <div key={tier} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">
                {tier === "gold" ? "🏆" : tier === "silver" ? "🥈" : "🥉"}
              </span>
              <h3 className="font-heading font-semibold text-foreground capitalize">
                {tier} Members
              </h3>
              <span className="text-xs text-muted-foreground">
                ({tierProviders.length})
              </span>
            </div>
            {tierProviders.length === 0 ? (
              <p className="text-sm text-muted-foreground italic pl-2">
                No {tier} members
              </p>
            ) : (
              <div className="space-y-2">
                {tierProviders.map((p, i) => (
                  <div
                    key={p.id}
                    data-ocid={`membership.item.${i + 1}`}
                    className="bg-card rounded-xl border border-border p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.serviceType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MembershipBadge type={p.membershipType} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`membership.change.button.${i + 1}`}
                            className="text-xs"
                          >
                            Change
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {tiers
                            .filter((t) => t !== tier)
                            .map((t) => (
                              <DropdownMenuItem
                                key={t}
                                onClick={() => handleChange(p.id, t)}
                                className="capitalize"
                              >
                                {t === "gold"
                                  ? "🏆"
                                  : t === "silver"
                                    ? "🥈"
                                    : "🥉"}{" "}
                                {t}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AdminOtherPages({ section }: { section: string }) {
  const content = () => {
    switch (section) {
      case "customers":
        return <CustomersPage />;
      case "orders":
        return <WorkOrdersPage />;
      case "payments":
        return <PaymentsPage />;
      case "membership":
        return <MembershipManagement />;
      default:
        return null;
    }
  };
  return <div className="p-6">{content()}</div>;
}
