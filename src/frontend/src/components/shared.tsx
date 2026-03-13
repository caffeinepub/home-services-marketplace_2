import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function MembershipBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    gold: { label: "🏆 Gold", cls: "badge-gold" },
    silver: { label: "🥈 Silver", cls: "badge-silver" },
    bronze: { label: "🥉 Bronze", cls: "badge-bronze" },
  };
  const c = config[type] ?? config.bronze;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

export function StatusChip({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    requested: { label: "Requested", cls: "status-requested" },
    accepted: { label: "Accepted", cls: "status-accepted" },
    inProgress: { label: "In Progress", cls: "status-inprogress" },
    completed: { label: "Completed", cls: "status-completed" },
    cancelled: { label: "Cancelled", cls: "status-cancelled" },
  };
  const c = config[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

export function ApprovalBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    pending: { label: "⏳ Pending", cls: "bg-yellow-100 text-yellow-700" },
    approved: { label: "✓ Approved", cls: "bg-green-100 text-green-700" },
    rejected: { label: "✗ Rejected", cls: "bg-red-100 text-red-700" },
  };
  const c = config[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

export function ProviderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {status === "active" ? "● Active" : "● Inactive"}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-ocid="page.button"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
        >
          ←
        </button>
      )}
      <div>
        <h1 className="text-lg font-bold font-heading text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="bg-card rounded-xl p-4 border border-border"
      data-ocid="skeleton.loading_state"
    >
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-4" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static loading skeleton
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      data-ocid="content.empty_state"
    >
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-xs">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold font-heading text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export { Badge };
