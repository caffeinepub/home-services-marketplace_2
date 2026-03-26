import {
  AuthClient,
  type AuthClientCreateOptions,
  type AuthClientLoginOptions,
} from "@dfinity/auth-client";
import type { Identity } from "@icp-sdk/core/agent";
import { DelegationIdentity, isDelegationValid } from "@icp-sdk/core/identity";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadConfig } from "../config";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  identity?: Identity;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
};

const ONE_HOUR_IN_NANOSECONDS = BigInt(3_600_000_000_000);
const DEFAULT_IDENTITY_PROVIDER = process.env.II_URL;

type ProviderValue = InternetIdentityContext;
const InternetIdentityReactContext = createContext<ProviderValue | undefined>(
  undefined,
);

async function createAuthClient(
  createOptions?: AuthClientCreateOptions,
): Promise<AuthClient> {
  const config = await loadConfig();
  const options: AuthClientCreateOptions = {
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...createOptions?.idleOptions,
    },
    loginOptions: {
      derivationOrigin: config.ii_derivation_origin,
    },
    ...createOptions,
  };
  return AuthClient.create(options);
}

function assertProviderPresent(
  context: ProviderValue | undefined,
): asserts context is ProviderValue {
  if (!context) {
    throw new Error(
      "InternetIdentityProvider is not present. Wrap your component tree with it.",
    );
  }
}

export const useInternetIdentity = (): InternetIdentityContext => {
  const context = useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
};

export function InternetIdentityProvider({
  children,
  createOptions,
}: PropsWithChildren<{
  children: ReactNode;
  createOptions?: AuthClientCreateOptions;
}>) {
  const [authClient, setAuthClient] = useState<AuthClient | undefined>(
    undefined,
  );
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);
  const initDone = useRef(false);

  const setErrorMessage = useCallback((message: string) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);

  const handleLoginSuccess = useCallback(
    (client: AuthClient) => {
      const latestIdentity = client.getIdentity();
      if (!latestIdentity) {
        setErrorMessage("Identity not found after successful login");
        return;
      }
      setIdentity(latestIdentity);
      setStatus("success");
      setError(undefined);
    },
    [setErrorMessage],
  );

  const handleLoginError = useCallback(
    (maybeError?: string) => {
      // User cancelled or popup closed -- go back to idle so the button is usable again
      setStatus("idle");
      setError(undefined);
      if (
        maybeError &&
        !maybeError.toLowerCase().includes("user closed") &&
        !maybeError.toLowerCase().includes("cancel")
      ) {
        setErrorMessage(maybeError);
      }
    },
    [setErrorMessage],
  );

  // Core init logic extracted so it can be retried
  const runInit = useCallback(async (options?: AuthClientCreateOptions) => {
    setStatus("initializing");
    setError(undefined);
    try {
      const client = await createAuthClient(options);
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      if (isAuthenticated) {
        const loadedIdentity = client.getIdentity();
        setIdentity(loadedIdentity);
        setStatus("success");
      } else {
        setStatus("idle");
      }
      return client;
    } catch (unknownError) {
      setStatus("loginError");
      setError(
        unknownError instanceof Error
          ? unknownError
          : new Error("Initialization failed"),
      );
      return null;
    }
  }, []);

  const login = useCallback(() => {
    const doLogin = (client: AuthClient) => {
      const currentIdentity = client.getIdentity();
      // If a valid saved session exists, log in immediately without opening the popup
      if (
        !currentIdentity.getPrincipal().isAnonymous() &&
        currentIdentity instanceof DelegationIdentity &&
        isDelegationValid(currentIdentity.getDelegation())
      ) {
        handleLoginSuccess(client);
        return;
      }

      const options: AuthClientLoginOptions = {
        identityProvider: DEFAULT_IDENTITY_PROVIDER,
        onSuccess: () => handleLoginSuccess(client),
        onError: handleLoginError,
        maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30), // 30 days
      };

      setStatus("logging-in");
      void client.login(options);
    };

    if (!authClient) {
      // Auth client not ready -- retry initialization then login
      void runInit(createOptions).then((client) => {
        if (client) doLogin(client);
      });
      return;
    }

    doLogin(authClient);
  }, [
    authClient,
    handleLoginError,
    handleLoginSuccess,
    runInit,
    createOptions,
  ]);

  const clear = useCallback(() => {
    if (!authClient) {
      setErrorMessage("Auth client not initialized");
      return;
    }

    void authClient
      .logout()
      .then(() => {
        setIdentity(undefined);
        setStatus("idle");
        setError(undefined);
      })
      .catch((unknownError: unknown) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [authClient, setErrorMessage]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    void runInit(createOptions);
  }, []);

  const value = useMemo<ProviderValue>(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
    }),
    [identity, login, clear, loginStatus, loginError],
  );

  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
