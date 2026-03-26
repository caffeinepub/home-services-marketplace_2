interface NavItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
}

interface BottomNavProps {
  items: NavItem[];
  active: string;
  onChange: (id: string) => void;
}

export function BottomNav({ items, active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="mobile-container flex">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onChange(item.id)}
              data-ocid={`nav.${item.id}.tab`}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-xl">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`text-xs mt-0.5 font-medium ${isActive ? "text-primary" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
