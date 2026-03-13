import { BottomNav } from "@/components/BottomNav";
import { EmptyState, LoadingGrid, StatusChip } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS, SERVICE_CATEGORIES } from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import { useMyWorkOrders } from "@/hooks/useQueries";
import { motion } from "motion/react";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠", activeIcon: "🏠" },
  { id: "services", label: "Services", icon: "🔧", activeIcon: "🔧" },
  { id: "orders", label: "Orders", icon: "📋", activeIcon: "📋" },
  { id: "profile", label: "Profile", icon: "👤", activeIcon: "👤" },
];

function CustomerHome() {
  const { navigate, customer } = useAppContext();
  const [location, setLocation] = useState(
    customer?.baseLocation ?? LOCATIONS[0],
  );

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-primary-foreground/70 text-sm">Good morning,</p>
            <h1 className="font-heading text-2xl font-bold">
              {customer?.name ?? "Guest"} 👋
            </h1>
          </div>
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center text-xl">
            🏠
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary-foreground/15 rounded-xl px-3 py-2">
          <span className="text-sm">📍</span>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger
              data-ocid="home.location.select"
              className="border-0 bg-transparent text-primary-foreground h-auto p-0 text-sm font-medium focus:ring-0 shadow-none"
            >
              <SelectValue />
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
      </div>

      <div className="p-4">
        <h2 className="font-heading font-semibold text-foreground mb-4 text-base">
          What do you need?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_CATEGORIES.map((cat, i) => (
            <motion.button
              type="button"
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() =>
                navigate("customer-create-request", { categoryId: cat.id })
              }
              data-ocid={`service.${cat.id}.card`}
              className={`${cat.bgClass} border ${cat.borderClass} rounded-2xl p-4 text-left hover:shadow-md transition-all active:scale-95`}
            >
              <div
                className={`w-10 h-10 ${cat.iconBgClass} rounded-xl flex items-center justify-center text-xl mb-3`}
              >
                {cat.emoji}
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm">
                {cat.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {cat.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <h2 className="font-heading font-semibold text-foreground mb-3 text-base">
          How it works
        </h2>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          {[
            { step: "1", text: "Choose a service category", icon: "🔍" },
            { step: "2", text: "Select a verified provider", icon: "✅" },
            { step: "3", text: "Track your service in real-time", icon: "📍" },
            { step: "4", text: "Pay securely after completion", icon: "💳" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {s.step}
              </div>
              <span className="text-xl">{s.icon}</span>
              <span className="text-sm text-foreground">{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceCategoriesPage() {
  const { navigate } = useAppContext();
  return (
    <div className="pb-20 p-4">
      <h2 className="font-heading font-semibold text-foreground mb-4 text-lg">
        All Services
      </h2>
      <div className="space-y-3">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() =>
              navigate("customer-create-request", { categoryId: cat.id })
            }
            data-ocid={`service.cat.${cat.id}.card`}
            className={`w-full ${cat.bgClass} border ${cat.borderClass} rounded-2xl p-4 text-left hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 ${cat.iconBgClass} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {cat.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cat.services.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-white/70 border border-border rounded-full px-2 py-0.5 text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function OrdersListPage() {
  const { navigate, customer } = useAppContext();
  const { data: orders, isLoading } = useMyWorkOrders(customer?.id);

  if (isLoading) return <LoadingGrid />;

  const active =
    orders?.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled",
    ) ?? [];
  const history =
    orders?.filter(
      (o) => o.status === "completed" || o.status === "cancelled",
    ) ?? [];

  if (!orders || orders.length === 0) {
    return (
      <div className="pb-20">
        <EmptyState
          emoji="📋"
          title="No orders yet"
          description="Book a service to get started"
          action={
            <Button
              onClick={() => navigate("customer-home")}
              data-ocid="orders.primary_button"
            >
              Book a Service
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {active.length > 0 && (
        <div className="p-4">
          <h3 className="font-heading font-semibold text-foreground mb-3">
            Active Orders
          </h3>
          <div className="space-y-3">
            {active.map((order, i) => (
              <div
                key={order.id}
                data-ocid={`orders.item.${i + 1}`}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm truncate max-w-[180px]">
                      {order.serviceType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.workLocation}
                    </p>
                  </div>
                  <StatusChip status={order.status} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {order.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate("customer-tracking", { workOrderId: order.id })
                    }
                    data-ocid={`orders.track.button.${i + 1}`}
                    className="flex-1 text-xs"
                  >
                    Track Order
                  </Button>
                  {order.status === "completed" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate("customer-payment", { workOrder: order })
                      }
                      data-ocid={`orders.pay.button.${i + 1}`}
                      className="flex-1 text-xs"
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-4">
          <h3 className="font-heading font-semibold text-foreground mb-3">
            History
          </h3>
          <div className="space-y-2">
            {history.map((order, i) => (
              <div
                key={order.id}
                data-ocid={`orders.history.item.${i + 1}`}
                className="bg-card rounded-xl border border-border p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {order.serviceType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.workLocation}
                  </p>
                </div>
                <StatusChip status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerProfilePage() {
  const { customer, navigate } = useAppContext();

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold">{customer?.name}</h2>
            <p className="text-primary-foreground/70 text-sm">
              Customer ID: {customer?.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Mobile</p>
          <p className="font-medium text-foreground">{customer?.mobile}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Base Location</p>
          <p className="font-medium text-foreground">
            📍 {customer?.baseLocation}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
          <p className="font-mono text-sm text-foreground">{customer?.id}</p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("customer-history")}
          data-ocid="profile.history.button"
        >
          View Service History
        </Button>
      </div>
    </div>
  );
}

export function CustomerApp() {
  const [activeTab, setActiveTab] = useState("home");

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <CustomerHome />;
      case "services":
        return <ServiceCategoriesPage />;
      case "orders":
        return <OrdersListPage />;
      case "profile":
        return <CustomerProfilePage />;
      default:
        return <CustomerHome />;
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
