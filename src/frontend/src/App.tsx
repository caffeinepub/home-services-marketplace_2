import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { useCallerRole, useMyProfile } from "@/hooks/useQueries";
import { useAuth } from "@/lib/auth";
import { AdminApp } from "@/pages/admin/AdminApp";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ChooseProvider } from "@/pages/customer/ChooseProvider";
import { CreateServiceRequest } from "@/pages/customer/CreateServiceRequest";
import { CustomerApp } from "@/pages/customer/CustomerApp";
import { ServiceHistory } from "@/pages/customer/CustomerProfile";
import { OrderTracking } from "@/pages/customer/OrderTracking";
import { PaymentScreen } from "@/pages/customer/PaymentScreen";
import { ProviderApp } from "@/pages/provider/ProviderApp";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function AppRouter() {
  const { isLoggedIn, isInitializing } = useAuth();
  const { page, navigate, setCustomer, setProvider } = useAppContext();

  const { data: role, isLoading: roleLoading } = useCallerRole();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  const [routed, setRouted] = useState(false);

  const doRoute = useCallback(() => {
    if (!isLoggedIn || roleLoading || profileLoading || routed) return;

    if (role === "admin") {
      navigate("admin-dashboard");
      setRouted(true);
      return;
    }

    if (profile) {
      if (profile.__kind__ === "customer") {
        setCustomer(profile.customer);
        navigate("customer-home");
      } else if (profile.__kind__ === "provider") {
        setProvider(profile.provider);
        navigate("provider-dashboard");
      }
    } else {
      navigate("register");
    }
    setRouted(true);
  }, [
    isLoggedIn,
    roleLoading,
    profileLoading,
    routed,
    role,
    profile,
    navigate,
    setCustomer,
    setProvider,
  ]);

  useEffect(() => {
    doRoute();
  }, [doRoute]);

  useEffect(() => {
    if (!isLoggedIn && !isInitializing) {
      setRouted(false);
      navigate("login");
    }
  }, [isLoggedIn, isInitializing, navigate]);

  if (
    isInitializing ||
    (isLoggedIn && (roleLoading || profileLoading) && !routed)
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Loading HomeServe...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (page === "register") {
    return (
      <RegisterPage
        onSuccess={() => {
          setRouted(false);
        }}
      />
    );
  }

  if (
    page === "customer-home" ||
    page === "customer-profile" ||
    page === "customer-services" ||
    page === "customer-orders"
  ) {
    return <CustomerApp />;
  }
  if (page === "customer-create-request") return <CreateServiceRequest />;
  if (page === "customer-choose-provider") return <ChooseProvider />;
  if (page === "customer-tracking") return <OrderTracking />;
  if (page === "customer-payment") return <PaymentScreen />;
  if (page === "customer-history") return <ServiceHistory />;

  if (
    page === "provider-dashboard" ||
    page === "provider-jobs" ||
    page === "provider-active" ||
    page === "provider-completed" ||
    page === "provider-profile"
  ) {
    return <ProviderApp />;
  }

  if (
    page === "admin-dashboard" ||
    page === "admin-providers" ||
    page === "admin-customers" ||
    page === "admin-orders" ||
    page === "admin-payments" ||
    page === "admin-membership"
  ) {
    return <AdminApp />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster richColors position="top-center" />
    </AppProvider>
  );
}
