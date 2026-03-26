import type { Customer, ServiceProvider } from "@/backend.d";
import { type ReactNode, createContext, useContext, useState } from "react";

export type AppPage =
  | "login"
  | "register"
  | "otp"
  | "customer-home"
  | "customer-services"
  | "customer-orders"
  | "customer-create-request"
  | "customer-choose-provider"
  | "customer-tracking"
  | "customer-payment"
  | "customer-history"
  | "customer-profile"
  | "provider-dashboard"
  | "provider-jobs"
  | "provider-active"
  | "provider-completed"
  | "provider-profile"
  | "admin-dashboard"
  | "admin-providers"
  | "admin-customers"
  | "admin-orders"
  | "admin-payments"
  | "admin-membership";

interface AppContextType {
  page: AppPage;
  navigate: (page: AppPage, params?: Record<string, unknown>) => void;
  params: Record<string, unknown>;
  customer: Customer | null;
  provider: ServiceProvider | null;
  setCustomer: (c: Customer | null) => void;
  setProvider: (p: ServiceProvider | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<AppPage>("login");
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);

  const navigate = (
    nextPage: AppPage,
    nextParams?: Record<string, unknown>,
  ) => {
    setPage(nextPage);
    setParams(nextParams ?? {});
  };

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,
        params,
        customer,
        provider,
        setCustomer,
        setProvider,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
