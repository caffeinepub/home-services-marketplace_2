import type { WorkOrder } from "@/backend.d";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { useCreatePayment, useUpdatePaymentStatus } from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PAYMENT_MODES = [
  { id: "upi", label: "UPI", icon: "📱", desc: "Pay via UPI apps" },
  { id: "card", label: "Card", icon: "💳", desc: "Credit / Debit card" },
  { id: "cash", label: "Cash", icon: "💵", desc: "Pay at the time of service" },
];

export function PaymentScreen() {
  const { navigate, customer, params } = useAppContext();
  const order = params.workOrder as WorkOrder | undefined;
  const [paymentMode, setPaymentMode] = useState("upi");
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const createPayment = useCreatePayment();
  const updatePaymentStatus = useUpdatePaymentStatus();

  const estimatedHours = 2;
  const estimatedAmount = BigInt(1000);

  const handlePay = async () => {
    if (!customer || !order) return;
    setIsPaying(true);
    try {
      const paymentId = await createPayment.mutateAsync({
        workOrderId: order.id,
        paymentMode,
        amount: estimatedAmount,
        customerId: customer.id,
      });
      await updatePaymentStatus.mutateAsync({ paymentId, status: "paid" });
      setPaid(true);
      toast.success("Payment successful! Thank you.");
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (paid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mobile-container p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Payment Successful!
          </h2>
          <p className="text-muted-foreground mb-8">
            Your payment has been processed successfully.
          </p>
          <Button
            onClick={() => navigate("customer-home")}
            data-ocid="payment.success.button"
            className="w-full font-semibold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container">
        <PageHeader
          title="Payment"
          subtitle="Complete your payment"
          onBack={() =>
            navigate("customer-tracking", { workOrderId: order?.id })
          }
        />

        <div className="p-4 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">
                  {order?.serviceType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">
                  {order?.workLocation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Hours</span>
                <span className="font-medium text-foreground">
                  {estimatedHours}h
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground">
                  Total Amount
                </span>
                <span className="font-bold text-xl text-primary">
                  ₹{estimatedAmount.toString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Payment Method
            </h3>
            <div className="space-y-2">
              {PAYMENT_MODES.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  data-ocid="payment.mode.toggle"
                  className={[
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    paymentMode === mode.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50",
                  ].join(" ")}
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {mode.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{mode.desc}</p>
                  </div>
                  {paymentMode === mode.id && (
                    <span className="ml-auto text-primary font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={isPaying}
            data-ocid="payment.submit_button"
            className="w-full h-12 text-base font-semibold"
          >
            {isPaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              `Pay ₹${estimatedAmount.toString()} via ${paymentMode.toUpperCase()}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
