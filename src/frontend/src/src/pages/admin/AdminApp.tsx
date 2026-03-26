import { StatCard } from "@/components/shared";
import { useAggregates } from "@/hooks/useQueries";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { AdminOtherPages } from "./AdminOtherPages";
import { ProvidersManagement } from "./ProvidersManagement";

const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "providers", label: "Providers", icon: "🔧" },
  { id: "customers", label: "Customers", icon: "👥" },
  { id: "orders", label: "Orders", icon: "📋" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "membership", label: "Membership", icon: "🏆" },
];

function AdminDashboard() {
  const { data: agg, isLoading } = useAggregates();

  const stats = [
    {
      label: "Total Providers",
      value: agg ? Number(agg.providerCount) : 0,
      icon: "🔧",
      color: "blue",
    },
    {
      label: "Total Customers",
      value: agg ? Number(agg.customerCount) : 0,
      icon: "👥",
      color: "green",
    },
    {
      label: "Active Orders",
      value: agg ? Number(agg.activeWorkOrdersCount) : 0,
      icon: "⚡",
      color: "yellow",
    },
    {
      label: "Completed Jobs",
      value: agg ? Number(agg.completedWorkOrdersCount) : 0,
      icon: "✅",
      color: "teal",
    },
    {
      label: "Total Revenue (₹)",
      value: agg ? Number(agg.totalRevenue) : 0,
      icon: "💰",
      color: "purple",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Platform metrics at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={isLoading ? "..." : s.value}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          Platform Activity
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Provider Approval Rate",
              value: agg
                ? Math.round(
                    (Number(agg.completedWorkOrdersCount) /
                      Math.max(Number(agg.providerCount), 1)) *
                      100,
                  )
                : 0,
              color: "bg-primary",
            },
            {
              label: "Order Completion Rate",
              value: agg
                ? Math.min(
                    Math.round(
                      (Number(agg.completedWorkOrdersCount) /
                        Math.max(
                          Number(agg.activeWorkOrdersCount) +
                            Number(agg.completedWorkOrdersCount),
                          1,
                        )) *
                        100,
                    ),
                    100,
                  )
                : 0,
              color: "bg-green-500",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">
                  {item.value}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div
                  className={`h-2 ${item.color} rounded-full transition-all`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminApp() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { logout } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "providers":
        return <ProvidersManagement />;
      case "customers":
        return <AdminOtherPages section="customers" />;
      case "orders":
        return <AdminOtherPages section="orders" />;
      case "payments":
        return <AdminOtherPages section="payments" />;
      case "membership":
        return <AdminOtherPages section="membership" />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground min-h-screen">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl">
              🏠
            </div>
            <div>
              <h1 className="font-heading font-bold text-sidebar-foreground">
                HomeServe
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              data-ocid={`admin.${item.id}.link`}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activeSection === item.id
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50",
              ].join(" ")}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button
            type="button"
            onClick={() => logout()}
            data-ocid="admin.logout.button"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="md:hidden bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-heading font-bold">HomeServe Admin</span>
          </div>
        </div>

        <div className="md:hidden overflow-x-auto">
          <div className="flex gap-1 p-2 bg-card border-b border-border min-w-max">
            {ADMIN_NAV.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                data-ocid={`admin.mob.${item.id}.tab`}
                className={[
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                ].join(" ")}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-auto">{renderSection()}</main>
      </div>
    </div>
  );
}
