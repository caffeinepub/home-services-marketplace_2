import { PageHeader, StatusChip } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { useMyWorkOrders } from "@/hooks/useQueries";

export function ServiceHistory() {
  const { navigate, customer } = useAppContext();
  const { data: orders, isLoading } = useMyWorkOrders(customer?.id);

  const completed = orders?.filter((o) => o.status === "completed") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container">
        <PageHeader
          title="Service History"
          onBack={() => navigate("customer-home")}
        />
        <div className="p-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : completed.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📜</div>
              <p className="font-heading font-semibold text-foreground">
                No completed orders yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Completed services will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((order, i) => (
                <div
                  key={order.id}
                  data-ocid={`history.item.${i + 1}`}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {order.serviceType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.workLocation}
                      </p>
                    </div>
                    <StatusChip status={order.status} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {order.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(
                      Number(order.dateTimeRequested) / 1_000_000,
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
