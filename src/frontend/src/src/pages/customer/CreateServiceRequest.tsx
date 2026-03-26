import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOCATIONS, SERVICE_CATEGORIES, SERVICE_TYPES } from "@/constants";
import { useAppContext } from "@/contexts/AppContext";
import { useCreateWorkOrder } from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateServiceRequest() {
  const { navigate, customer, params } = useAppContext();
  const categoryId = params.categoryId as string | undefined;
  const defaultCat = SERVICE_CATEGORIES.find((c) => c.id === categoryId);

  const [description, setDescription] = useState("");
  const [workLocation, setWorkLocation] = useState(
    customer?.baseLocation ?? "",
  );
  const [serviceType, setServiceType] = useState("");
  const [serviceRequest, setServiceRequest] = useState(
    defaultCat ? defaultCat.services[0] : "",
  );

  const createWorkOrder = useCreateWorkOrder();

  const handleSubmit = async () => {
    if (!customer) {
      toast.error("Not logged in");
      return;
    }
    if (!description || !workLocation || !serviceType || !serviceRequest) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const workOrderId = await createWorkOrder.mutateAsync({
        customerId: customer.id,
        description,
        workLocation,
        serviceRequest,
        serviceType,
      });
      toast.success("Service request created!");
      navigate("customer-choose-provider", { workOrderId, workLocation });
    } catch {
      toast.error("Failed to create request. Try again.");
    }
  };

  const selectedCat = SERVICE_CATEGORIES.find((c) =>
    c.services.includes(serviceRequest),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mobile-container">
        <PageHeader
          title="New Service Request"
          subtitle="Describe what you need"
          onBack={() => navigate("customer-home")}
        />

        <div className="p-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              SERVICE CATEGORY
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setServiceRequest(cat.services[0])}
                  data-ocid="create.category.toggle"
                  className={[
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                    selectedCat?.id === cat.id
                      ? `${cat.bgClass} ${cat.borderClass} text-foreground`
                      : "bg-card border-border text-muted-foreground hover:border-primary",
                  ].join(" ")}
                >
                  <span>{cat.emoji}</span> {cat.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger data-ocid="create.service_type.select">
                <SelectValue placeholder="e.g. Electrician" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCat && (
            <div className="space-y-1">
              <Label>Specific Service</Label>
              <Select value={serviceRequest} onValueChange={setServiceRequest}>
                <SelectTrigger data-ocid="create.service_request.select">
                  <SelectValue placeholder="Select specific service" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCat.services.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label>Work Location</Label>
            <Select value={workLocation} onValueChange={setWorkLocation}>
              <SelectTrigger data-ocid="create.location.select">
                <SelectValue placeholder="Select area" />
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

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. E.g. The main switch trips every time I turn on the AC..."
              rows={4}
              data-ocid="create.description.textarea"
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createWorkOrder.isPending}
            data-ocid="create.submit_button"
            className="w-full h-12 text-base font-semibold"
          >
            {createWorkOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Find Providers →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
