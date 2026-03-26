import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing, loginStatus } = useAuth();

  const isLoginError = loginStatus === "loginError";
  const isBusy = isLoggingIn || isInitializing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            HomeServe
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your trusted home services partner
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in securely with Internet Identity
          </p>

          {isLoginError && (
            <div className="flex items-center gap-2 text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Could not connect. Please try again.</span>
            </div>
          )}

          <Button
            onClick={() => login()}
            disabled={isBusy}
            data-ocid="login.primary_button"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isInitializing ? "Initializing..." : "Connecting..."}
              </>
            ) : (
              <>🔐 Connect with Internet Identity</>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            No account? You'll be prompted to register after connecting.
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", label: "Fast Service" },
            { icon: "🛡️", label: "Verified Pros" },
            { icon: "💳", label: "Easy Pay" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-card/60 rounded-xl p-3 text-center border border-border"
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-xs font-medium text-foreground">{f.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
