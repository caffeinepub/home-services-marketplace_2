import type {
  Aggregates,
  Customer,
  CustomerID,
  Payment,
  PaymentID,
  ProviderEarnings,
  ProviderID,
  ServiceProvider,
  WorkOrder,
  WorkOrderID,
} from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest";
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<
    | { __kind__: "provider"; provider: ServiceProvider }
    | { __kind__: "customer"; customer: Customer }
    | null
  >({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAllProviders() {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceProvider[]>({
    queryKey: ["allProviders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProviders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ["allCustomers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllWorkOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkOrder[]>({
    queryKey: ["allWorkOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAggregates() {
  const { actor, isFetching } = useActor();
  return useQuery<Aggregates | null>({
    queryKey: ["aggregates"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAggregates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyWorkOrders(customerId: CustomerID | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkOrder[]>({
    queryKey: ["myWorkOrders", customerId],
    queryFn: async () => {
      if (!actor || !customerId) return [];
      return actor.getMyWorkOrders(customerId);
    },
    enabled: !!actor && !isFetching && !!customerId,
  });
}

export function useProviderWorkOrders(providerId: ProviderID | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkOrder[]>({
    queryKey: ["providerWorkOrders", providerId],
    queryFn: async () => {
      if (!actor || !providerId) return [];
      return actor.getProviderWorkOrders(providerId);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useProviderEarnings(providerId: ProviderID | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderEarnings | null>({
    queryKey: ["providerEarnings", providerId],
    queryFn: async () => {
      if (!actor || !providerId) return null;
      return actor.getProviderEarnings(providerId);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useProvidersByServiceArea(location: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceProvider[]>({
    queryKey: ["providersByArea", location],
    queryFn: async () => {
      if (!actor || !location) return [];
      const res = await actor.getProvidersByServiceArea(location);
      return res.providers;
    },
    enabled: !!actor && !isFetching && !!location,
  });
}

export function useRegisterCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    CustomerID,
    Error,
    { name: string; mobile: string; baseLocation: string }
  >({
    mutationFn: async ({ name, mobile, baseLocation }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerCustomer(name, mobile, baseLocation);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}

export function useRegisterProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    ProviderID,
    Error,
    {
      name: string;
      mobile: string;
      serviceType: string;
      workingDays: string;
      workingHours: string;
      experienceYears: bigint;
      serviceAreas: string[];
      ratePerHour: bigint;
      workPreference: string[];
    }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerProvider(
        data.name,
        data.mobile,
        data.serviceType,
        data.workingDays,
        data.workingHours,
        data.experienceYears,
        data.serviceAreas,
        data.ratePerHour,
        data.workPreference,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}

export function useCreateWorkOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    WorkOrderID,
    Error,
    {
      customerId: CustomerID;
      description: string;
      workLocation: string;
      serviceRequest: string;
      serviceType: string;
    }
  >({
    mutationFn: async ({
      customerId,
      description,
      workLocation,
      serviceRequest,
      serviceType,
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createWorkOrder(
        customerId,
        description,
        workLocation,
        serviceRequest,
        serviceType,
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["myWorkOrders", vars.customerId] });
    },
  });
}

export function useAssignProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { workOrderId: WorkOrderID; providerId: ProviderID; customerId: CustomerID }
  >({
    mutationFn: async ({ workOrderId, providerId }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignProvider(workOrderId, providerId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["myWorkOrders", vars.customerId] });
    },
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    PaymentID,
    Error,
    {
      workOrderId: WorkOrderID;
      paymentMode: string;
      amount: bigint;
      customerId: CustomerID;
    }
  >({
    mutationFn: async ({ workOrderId, paymentMode, amount }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPayment(workOrderId, paymentMode as never, amount);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["myWorkOrders", vars.customerId] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, { paymentId: PaymentID; status: string }>({
    mutationFn: async ({ paymentId, status }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePaymentStatus(paymentId, status as never);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPayments"] });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { workOrderId: WorkOrderID; status: string; providerId?: string }
  >({
    mutationFn: async ({ workOrderId, status }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateWorkOrderStatus(workOrderId, status as never);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["providerWorkOrders", vars.providerId],
      });
      qc.invalidateQueries({ queryKey: ["allWorkOrders"] });
    },
  });
}

export function useAdminApproveProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, ProviderID>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminApproveProvider(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProviders"] }),
  });
}

export function useAdminRejectProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, ProviderID>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminRejectProvider(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProviders"] }),
  });
}

export function useAdminChangeMembership() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, { id: ProviderID; membershipType: string }>({
    mutationFn: async ({ id, membershipType }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminChangeMembershipType(id, membershipType as never);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProviders"] }),
  });
}

export function useAdminChangeProviderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<void, Error, { id: ProviderID; status: string }>({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminChangeProviderStatus(id, status as never);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allProviders"] }),
  });
}

export function useUpdateProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    {
      providerId: ProviderID;
      name: string;
      mobile: string;
      serviceType: string;
      workingDays: string;
      workingHours: string;
      experienceYears: bigint;
      serviceAreas: string[];
      ratePerHour: bigint;
      workPreference: string[];
    }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProvider(
        data.providerId,
        data.name,
        data.mobile,
        data.serviceType,
        data.workingDays,
        data.workingHours,
        data.experienceYears,
        data.serviceAreas,
        data.ratePerHour,
        data.workPreference,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["allProviders"] });
    },
  });
}
