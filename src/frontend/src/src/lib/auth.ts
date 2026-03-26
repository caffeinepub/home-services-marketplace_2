import { useInternetIdentity } from "@/hooks/useInternetIdentity";

export function useAuth() {
  const ii = useInternetIdentity();
  return {
    login: ii.login,
    logout: ii.clear,
    loginStatus: ii.loginStatus,
    identity: ii.identity,
    isInitializing: ii.isInitializing,
    isLoggedIn: ii.loginStatus === "success",
    isLoggingIn: ii.isLoggingIn,
  };
}
