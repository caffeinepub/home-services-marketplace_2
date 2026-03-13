import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";

actor {
  public type CustomerID = Text;
  public type ProviderID = Text;
  public type WorkOrderID = Text;
  public type PaymentID = Text;

  public type MembershipType = { #gold; #silver; #bronze };
  public type ProviderStatus = { #active; #inactive };
  public type WorkOrderStatus = { #requested; #accepted; #inProgress; #completed; #cancelled };
  public type PaymentMode = { #upi; #card; #cash };
  public type PaymentStatus = { #pending; #paid; #failed };
  public type ApprovalStatus = { #pending; #approved; #rejected };

  public type ServiceProvider = {
    id : ProviderID;
    name : Text;
    mobile : Text;
    serviceType : Text;
    workingDays : Text;
    workingHours : Text;
    experienceYears : Nat;
    serviceAreas : [Text];
    ratePerHour : Nat;
    workPreference : [Text];
    dateRegistered : Int;
    membershipType : MembershipType;
    status : ProviderStatus;
    approvalStatus : ApprovalStatus;
    userId : Principal;
  };

  public type Customer = {
    id : CustomerID;
    name : Text;
    mobile : Text;
    baseLocation : Text;
    userId : Principal;
  };

  public type WorkOrder = {
    id : WorkOrderID;
    customerId : CustomerID;
    description : Text;
    workLocation : Text;
    serviceRequest : Text;
    serviceType : Text;
    dateTimeRequested : Int;
    assignedProviderId : ?ProviderID;
    status : WorkOrderStatus;
  };

  public type Payment = {
    id : PaymentID;
    workOrderId : WorkOrderID;
    paymentMode : PaymentMode;
    amount : Nat;
    paymentStatus : PaymentStatus;
  };

  module ServiceProvider {
    public func compare(p1 : ServiceProvider, p2 : ServiceProvider) : Order.Order {
      switch ((p1.membershipType, p2.membershipType)) {
        case ((#gold, #silver)) { #less };
        case ((#gold, #bronze)) { #less };
        case ((#silver, #gold)) { #greater };
        case ((#silver, #bronze)) { #less };
        case ((#bronze, #gold)) { #greater };
        case ((#bronze, #silver)) { #greater };
        case (_) { Text.compare(p1.id, p2.id) };
      };
    };
  };

  public type Aggregates = {
    providerCount : Nat;
    customerCount : Nat;
    activeWorkOrdersCount : Nat;
    completedWorkOrdersCount : Nat;
    totalRevenue : Nat;
  };

  public type ProviderEarnings = {
    providerId : ProviderID;
    totalEarnings : Nat;
    completedWorkOrders : Nat;
  };

  public type FetchProvidersResponse = {
    providers : [ServiceProvider];
  };

  let providerCounter = Map.empty<Text, Nat>();
  let customerCounter = Map.empty<Text, Nat>();
  let workOrderCounter = Map.empty<Text, Nat>();
  let paymentCounter = Map.empty<Text, Nat>();

  let serviceProviders = Map.empty<ProviderID, ServiceProvider>();
  let customers = Map.empty<CustomerID, Customer>();
  let workOrders = Map.empty<WorkOrderID, WorkOrder>();
  let payments = Map.empty<PaymentID, Payment>();

  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func registerCustomer(name : Text, mobile : Text, baseLocation : Text) : async CustomerID {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to register");
    };
    let count = switch (customerCounter.get("customer")) {
      case (null) { 1 };
      case (?currValue) { currValue + 1 };
    };
    let id = "CUST-" # count.toText();
    let newCustomer : Customer = {
      id;
      name;
      mobile;
      baseLocation;
      userId = caller;
    };
    customers.add(id, newCustomer);
    customerCounter.add("customer", count);
    id;
  };

  public shared ({ caller }) func registerProvider(
    name : Text,
    mobile : Text,
    serviceType : Text,
    workingDays : Text,
    workingHours : Text,
    experienceYears : Nat,
    serviceAreas : [Text],
    ratePerHour : Nat,
    workPreference : [Text]
  ) : async ProviderID {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to register");
    };
    let count = switch (providerCounter.get("provider")) {
      case (null) { 1 };
      case (?currValue) { currValue + 1 };
    };
    let id = "PROV-" # count.toText();
    let newProvider : ServiceProvider = {
      id;
      name;
      mobile;
      serviceType;
      workingDays;
      workingHours;
      experienceYears;
      serviceAreas;
      ratePerHour;
      workPreference;
      dateRegistered = Time.now();
      membershipType = #bronze;
      status = #active;
      approvalStatus = #pending;
      userId = caller;
    };
    providerCounter.add("provider", count);
    serviceProviders.add(id, newProvider);
    id;
  };

  public query ({ caller }) func getMyProfile() : async {
    #customer : Customer;
    #provider : ServiceProvider;
  } {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in to view profile");
    };
    for ((_, customer) in customers.entries()) {
      if (customer.userId == caller) { return #customer(customer) };
    };
    for ((_, provider) in serviceProviders.entries()) {
      if (provider.userId == caller) { return #provider(provider) };
    };
    Runtime.trap("Profile not found for the current user");
  };

  public shared ({ caller }) func updateProvider(
    providerId : ProviderID,
    name : Text,
    mobile : Text,
    serviceType : Text,
    workingDays : Text,
    workingHours : Text,
    experienceYears : Nat,
    serviceAreas : [Text],
    ratePerHour : Nat,
    workPreference : [Text]
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (serviceProviders.get(providerId)) {
      case (null) {
        Runtime.trap("Provider not found");
      };
      case (?provider) {
        if (provider.userId != caller) {
          Runtime.trap("Unauthorized: You can only update your own provider profile");
        };
        let updatedProvider : ServiceProvider = {
          id = providerId;
          name;
          mobile;
          serviceType;
          workingDays;
          workingHours;
          experienceYears;
          serviceAreas;
          ratePerHour;
          workPreference;
          dateRegistered = provider.dateRegistered;
          membershipType = provider.membershipType;
          status = provider.status;
          approvalStatus = provider.approvalStatus;
          userId = caller;
        };
        serviceProviders.add(providerId, updatedProvider);
      };
    };
  };

  public shared ({ caller }) func adminApproveProvider(id : ProviderID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (serviceProviders.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?provider) {
        let providerUpdated : ServiceProvider = {
          id = provider.id;
          name = provider.name;
          mobile = provider.mobile;
          serviceType = provider.serviceType;
          workingDays = provider.workingDays;
          workingHours = provider.workingHours;
          experienceYears = provider.experienceYears;
          serviceAreas = provider.serviceAreas;
          ratePerHour = provider.ratePerHour;
          workPreference = provider.workPreference;
          dateRegistered = provider.dateRegistered;
          membershipType = provider.membershipType;
          status = provider.status;
          approvalStatus = #approved;
          userId = provider.userId;
        };
        serviceProviders.add(id, providerUpdated);
      };
    };
  };

  public shared ({ caller }) func adminRejectProvider(id : ProviderID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (serviceProviders.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?provider) {
        let providerUpdated : ServiceProvider = {
          id = provider.id;
          name = provider.name;
          mobile = provider.mobile;
          serviceType = provider.serviceType;
          workingDays = provider.workingDays;
          workingHours = provider.workingHours;
          experienceYears = provider.experienceYears;
          serviceAreas = provider.serviceAreas;
          ratePerHour = provider.ratePerHour;
          workPreference = provider.workPreference;
          dateRegistered = provider.dateRegistered;
          membershipType = provider.membershipType;
          status = provider.status;
          approvalStatus = #rejected;
          userId = provider.userId;
        };
        serviceProviders.add(id, providerUpdated);
      };
    };
  };

  public shared ({ caller }) func adminChangeMembershipType(
    id : ProviderID,
    membershipType : MembershipType,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (serviceProviders.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?provider) {
        let providerUpdated : ServiceProvider = {
          id = provider.id;
          name = provider.name;
          mobile = provider.mobile;
          serviceType = provider.serviceType;
          workingDays = provider.workingDays;
          workingHours = provider.workingHours;
          experienceYears = provider.experienceYears;
          serviceAreas = provider.serviceAreas;
          ratePerHour = provider.ratePerHour;
          workPreference = provider.workPreference;
          dateRegistered = provider.dateRegistered;
          membershipType;
          status = provider.status;
          approvalStatus = provider.approvalStatus;
          userId = provider.userId;
        };
        serviceProviders.add(id, providerUpdated);
      };
    };
  };

  public shared ({ caller }) func adminChangeProviderStatus(
    id : ProviderID,
    status : ProviderStatus,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (serviceProviders.get(id)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?provider) {
        let providerUpdated : ServiceProvider = {
          id = provider.id;
          name = provider.name;
          mobile = provider.mobile;
          serviceType = provider.serviceType;
          workingDays = provider.workingDays;
          workingHours = provider.workingHours;
          experienceYears = provider.experienceYears;
          serviceAreas = provider.serviceAreas;
          ratePerHour = provider.ratePerHour;
          workPreference = provider.workPreference;
          dateRegistered = provider.dateRegistered;
          membershipType = provider.membershipType;
          status;
          approvalStatus = provider.approvalStatus;
          userId = provider.userId;
        };
        serviceProviders.add(id, providerUpdated);
      };
    };
  };

  public query ({ caller }) func getAllProviders() : async [ServiceProvider] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all providers");
    };
    serviceProviders.values().toArray();
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    customers.values().toArray();
  };

  public shared ({ caller }) func createWorkOrder(
    customerId : CustomerID,
    description : Text,
    workLocation : Text,
    serviceRequest : Text,
    serviceType : Text
  ) : async WorkOrderID {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        if (customer.userId != caller) {
          Runtime.trap("Unauthorized: You can only create work orders for your own customer account");
        };
      };
    };
    let count = switch (workOrderCounter.get("workOrder")) {
      case (null) { 1 };
      case (?currValue) { currValue + 1 };
    };
    let id = "WO-" # count.toText();
    let newWorkOrder : WorkOrder = {
      id;
      customerId;
      description;
      workLocation;
      serviceRequest;
      serviceType;
      dateTimeRequested = Time.now();
      assignedProviderId = null;
      status = #requested;
    };
    workOrderCounter.add("workOrder", count);
    workOrders.add(id, newWorkOrder);
    id;
  };

  public query ({ caller }) func getMyWorkOrders(customerId : CustomerID) : async [WorkOrder] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (customers.get(customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        if (customer.userId != caller) {
          Runtime.trap("Unauthorized: You can only view your own work orders");
        };
      };
    };
    workOrders.values().toArray().filter(
      func(order) { order.customerId == customerId });
  };

  public query ({ caller }) func getProvidersByServiceArea(
    customerLocation : Text,
  ) : async FetchProvidersResponse {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    let matchingProvidersList = List.empty<ServiceProvider>();

    for (provider in serviceProviders.values()) {
      let _ = provider.serviceAreas.find(
        func(area) { Text.equal(area, customerLocation) }
      );
      if (provider.approvalStatus == #approved and provider.status == #active) {
        matchingProvidersList.add(provider);
      };
    };

    let sortedProviders = matchingProvidersList.toArray().sort();

    {
      providers = sortedProviders;
    };
  };

  public shared ({ caller }) func assignProvider(
    workOrderId : WorkOrderID,
    providerId : ProviderID,
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (workOrders.get(workOrderId)) {
      case (null) { Runtime.trap("Work order not found") };
      case (?workOrder) {
        switch (customers.get(workOrder.customerId)) {
          case (null) { Runtime.trap("Customer not found") };
          case (?customer) {
            if (customer.userId != caller) {
              Runtime.trap("Unauthorized: You can only assign providers to your own work orders");
            };
          };
        };
        let updatedOrder : WorkOrder = {
          id = workOrder.id;
          customerId = workOrder.customerId;
          description = workOrder.description;
          workLocation = workOrder.workLocation;
          serviceRequest = workOrder.serviceRequest;
          serviceType = workOrder.serviceType;
          dateTimeRequested = workOrder.dateTimeRequested;
          assignedProviderId = ?providerId;
          status = workOrder.status;
        };
        workOrders.add(workOrderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getProviderWorkOrders(
    providerId : ProviderID,
  ) : async [WorkOrder] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (serviceProviders.get(providerId)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?provider) {
        if (provider.userId != caller) {
          Runtime.trap("Unauthorized: You can only view work orders for your own provider account");
        };
      };
    };
    workOrders.values().toArray().filter(
      func(order) { order.assignedProviderId == ?providerId });
  };

  public shared ({ caller }) func updateWorkOrderStatus(
    workOrderId : WorkOrderID,
    status : WorkOrderStatus,
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (workOrders.get(workOrderId)) {
      case (null) { Runtime.trap("Work order not found") };
      case (?workOrder) {
        switch (workOrder.assignedProviderId) {
          case (null) { Runtime.trap("Work order has no assigned provider") };
          case (?pId) {
            switch (serviceProviders.get(pId)) {
              case (null) { Runtime.trap("Provider not found") };
              case (?provider) {
                if (provider.userId != caller) {
                  Runtime.trap("Unauthorized: You can only update status for work orders assigned to your provider account");
                };
              };
            };
          };
        };
        let updatedOrder : WorkOrder = {
          id = workOrder.id;
          customerId = workOrder.customerId;
          description = workOrder.description;
          workLocation = workOrder.workLocation;
          serviceRequest = workOrder.serviceRequest;
          serviceType = workOrder.serviceType;
          dateTimeRequested = workOrder.dateTimeRequested;
          assignedProviderId = workOrder.assignedProviderId;
          status;
        };
        workOrders.add(workOrderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func createPayment(
    workOrderId : WorkOrderID,
    paymentMode : PaymentMode,
    amount : Nat,
  ) : async PaymentID {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (workOrders.get(workOrderId)) {
      case (null) { Runtime.trap("Work order not found") };
      case (?workOrder) {
        switch (customers.get(workOrder.customerId)) {
          case (null) { Runtime.trap("Customer not found") };
          case (?customer) {
            if (customer.userId != caller) {
              Runtime.trap("Unauthorized: You can only create payments for your own work orders");
            };
          };
        };
      };
    };
    let count = switch (paymentCounter.get("payment")) {
      case (null) { 1 };
      case (?currValue) { currValue + 1 };
    };
    let id = "PAY-" # count.toText();
    let newPayment : Payment = {
      id;
      workOrderId;
      paymentMode;
      amount;
      paymentStatus = #pending;
    };
    paymentCounter.add("payment", count);
    payments.add(id, newPayment);
    id;
  };

  public shared ({ caller }) func updatePaymentStatus(
    paymentId : PaymentID,
    status : PaymentStatus,
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        switch (workOrders.get(payment.workOrderId)) {
          case (null) { Runtime.trap("Work order not found") };
          case (?workOrder) {
            switch (customers.get(workOrder.customerId)) {
              case (null) { Runtime.trap("Customer not found") };
              case (?customer) {
                if (customer.userId != caller) {
                  Runtime.trap("Unauthorized: You can only update payment status for your own payments");
                };
              };
            };
          };
        };
        let updatedPayment : Payment = {
          id = payment.id;
          workOrderId = payment.workOrderId;
          paymentMode = payment.paymentMode;
          amount = payment.amount;
          paymentStatus = status;
        };
        payments.add(paymentId, updatedPayment);
      };
    };
  };

  public query ({ caller }) func getAllWorkOrders() : async [WorkOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all work orders");
    };
    workOrders.values().toArray();
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    payments.values().toArray();
  };

  public query ({ caller }) func getAggregates() : async Aggregates {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view aggregates");
    };
    let providerCount = serviceProviders.size();
    let customerCount = customers.size();

    var activeOrders = 0;
    var completedOrders = 0;
    var totalRevenue = 0;

    for (workOrder in workOrders.values()) {
      if (workOrder.status == #inProgress) { activeOrders += 1 };
      if (workOrder.status == #completed) { completedOrders += 1 };
    };

    for (payment in payments.values()) {
      if (payment.paymentStatus == #paid) { totalRevenue += payment.amount };
    };

    {
      providerCount;
      customerCount;
      activeWorkOrdersCount = activeOrders;
      completedWorkOrdersCount = completedOrders;
      totalRevenue;
    };
  };

  public query ({ caller }) func getProviderEarnings(
    providerId : ProviderID,
  ) : async ProviderEarnings {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (serviceProviders.get(providerId)) {
      case (null) { Runtime.trap("Provider not found") };
      case (?provider) {
        if (provider.userId != caller) {
          Runtime.trap("Unauthorized: You can only view earnings for your own provider account");
        };
      };
    };
    var totalEarnings = 0;
    var completedWorkOrders = 0;

    for ((_, order) in workOrders.entries()) {
      if (order.assignedProviderId == ?providerId and order.status == #completed) {
        completedWorkOrders += 1;
        switch (order.assignedProviderId) {
          case (?id) {
            if (id == providerId) {
              for (payment in payments.values()) {
                if (payment.workOrderId == order.id and payment.paymentStatus == #paid) {
                  totalEarnings += payment.amount;
                };
              };
            };
          };
          case (null) {};
        };
      };
    };

    {
      providerId;
      totalEarnings;
      completedWorkOrders;
    };
  };

  // Approval functions required by static check
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};
