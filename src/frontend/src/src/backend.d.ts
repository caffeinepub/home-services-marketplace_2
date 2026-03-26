import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FetchProvidersResponse {
    providers: Array<ServiceProvider>;
}
export interface Aggregates {
    providerCount: bigint;
    completedWorkOrdersCount: bigint;
    activeWorkOrdersCount: bigint;
    customerCount: bigint;
    totalRevenue: bigint;
}
export interface WorkOrder {
    id: WorkOrderID;
    status: WorkOrderStatus;
    serviceType: string;
    dateTimeRequested: bigint;
    description: string;
    customerId: CustomerID;
    serviceRequest: string;
    assignedProviderId?: ProviderID;
    workLocation: string;
}
export interface Payment {
    id: PaymentID;
    paymentStatus: PaymentStatus;
    workOrderId: WorkOrderID;
    paymentMode: PaymentMode;
    amount: bigint;
}
export type PaymentID = string;
export interface Customer {
    id: CustomerID;
    userId: Principal;
    name: string;
    baseLocation: string;
    mobile: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type ProviderID = string;
export interface ProviderEarnings {
    completedWorkOrders: bigint;
    totalEarnings: bigint;
    providerId: ProviderID;
}
export type WorkOrderID = string;
export interface ServiceProvider {
    id: ProviderID;
    status: ProviderStatus;
    dateRegistered: bigint;
    serviceType: string;
    userId: Principal;
    name: string;
    workPreference: Array<string>;
    approvalStatus: ApprovalStatus;
    workingHours: string;
    experienceYears: bigint;
    ratePerHour: bigint;
    workingDays: string;
    mobile: string;
    membershipType: MembershipType;
    serviceAreas: Array<string>;
}
export type CustomerID = string;
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum MembershipType {
    bronze = "bronze",
    gold = "gold",
    silver = "silver"
}
export enum PaymentMode {
    upi = "upi",
    card = "card",
    cash = "cash"
}
export enum PaymentStatus {
    pending = "pending",
    paid = "paid",
    failed = "failed"
}
export enum ProviderStatus {
    active = "active",
    inactive = "inactive"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WorkOrderStatus {
    requested = "requested",
    cancelled = "cancelled",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export interface backendInterface {
    adminApproveProvider(id: ProviderID): Promise<void>;
    adminChangeMembershipType(id: ProviderID, membershipType: MembershipType): Promise<void>;
    adminChangeProviderStatus(id: ProviderID, status: ProviderStatus): Promise<void>;
    adminRejectProvider(id: ProviderID): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignProvider(workOrderId: WorkOrderID, providerId: ProviderID): Promise<void>;
    createPayment(workOrderId: WorkOrderID, paymentMode: PaymentMode, amount: bigint): Promise<PaymentID>;
    createWorkOrder(customerId: CustomerID, description: string, workLocation: string, serviceRequest: string, serviceType: string): Promise<WorkOrderID>;
    getAggregates(): Promise<Aggregates>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllProviders(): Promise<Array<ServiceProvider>>;
    getAllWorkOrders(): Promise<Array<WorkOrder>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<{
        __kind__: "provider";
        provider: ServiceProvider;
    } | {
        __kind__: "customer";
        customer: Customer;
    }>;
    getMyWorkOrders(customerId: CustomerID): Promise<Array<WorkOrder>>;
    getProviderEarnings(providerId: ProviderID): Promise<ProviderEarnings>;
    getProviderWorkOrders(providerId: ProviderID): Promise<Array<WorkOrder>>;
    getProvidersByServiceArea(customerLocation: string): Promise<FetchProvidersResponse>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    registerCustomer(name: string, mobile: string, baseLocation: string): Promise<CustomerID>;
    registerProvider(name: string, mobile: string, serviceType: string, workingDays: string, workingHours: string, experienceYears: bigint, serviceAreas: Array<string>, ratePerHour: bigint, workPreference: Array<string>): Promise<ProviderID>;
    requestApproval(): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updatePaymentStatus(paymentId: PaymentID, status: PaymentStatus): Promise<void>;
    updateProvider(providerId: ProviderID, name: string, mobile: string, serviceType: string, workingDays: string, workingHours: string, experienceYears: bigint, serviceAreas: Array<string>, ratePerHour: bigint, workPreference: Array<string>): Promise<void>;
    updateWorkOrderStatus(workOrderId: WorkOrderID, status: WorkOrderStatus): Promise<void>;
}
