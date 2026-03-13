import type { WorkOrder } from "@/backend.d";
import { PageHeader, StatusChip } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/AppContext";
import { useMyWorkOrders } from "@/hooks/useQueries";

const STATUS_STEPS = [
  {
    key: "requested",
    label: "Requested",
    icon: "📝",
    desc: "Service request submitted",
  },
  {
    key: "accepted",
    label: "Accepted",
    icon: "✅",
    desc: "Provider accepted the job",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: "🔧",
    desc: "Service underway",
  },
  {
    key: "completed",
    label: "Completed",
    icon: "🎉",
    desc: "Service completed",
  },
];

const STATUS_INDEX: Record<string, number> = {
  requested: 0,
  accepted: 1,
  inProgress: 2,
  completed: 3,
  cancelled: -1,
};

function OrderTimeline({ order }: { order: WorkOrder }) {
  const currentIdx = STATUS_INDEX[order.status] ?? 0;

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                {isCompleted ? step.icon : i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-8 my-1 ${
                    i < currentIdx ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={`font-semibold text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrderTracking() {
  const { navigate, customer, params } = useAppContext();
  const workOrderId = params.workOrderId as string | undefined;
  const { data: orders, isLoading } = useMyWorkOrders(customer?.id);

  const order = orders?.find((o) => o.id === workOrderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mobile-container">
          <PageHeader
            title="Order Tracking"
            onBack={() => navigate("customer-home")}
          />
          <div className="p-4 space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mobile-container">
          <PageHeader
            title="Order Tracking"
            onBack={() => navigate("customer-home")}
          />
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Order not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container">
        <PageHeader
          title="Order Tracking"
          subtitle={`ID: ${order.id.slice(0, 8)}...`}
          onBack={() => navigate("customer-home")}
        />

        <div className="p-4 space-y-4">
          {/* Order Summary */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-heading font-semibold text-foreground">
                {order.serviceType}
              </h3>
              <StatusChip status={order.status} />
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">📍 {order.workLocation}</p>
              <p className="text-muted-foreground">🔧 {order.serviceRequest}</p>
              <p className="text-foreground/80 text-xs mt-2">
                {order.description}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== "cancelled" ? (
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-heading font-semibold text-foreground mb-4">
                Progress
              </h3>
              <OrderTimeline order={order} />
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-red-700 font-medium">
                This order was cancelled
              </p>
            </div>
          )}

          {/* Pay Button */}
          {order.status === "completed" && (
            <Button
              onClick={() => navigate("customer-payment", { workOrder: order })}
              data-ocid="tracking.pay.button"
              className="w-full h-12 text-base font-semibold"
            >
              💳 Proceed to Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
