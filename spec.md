# Home Services Marketplace

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack Local Home Services Marketplace with three user roles: Admin, Service Provider, Customer
- Authentication system: Login, Register, OTP Verification, role-based access
- Four Motoko data models: ServiceProviders, CustomersDtls, WorkOrderDtls, CustomerPayments
- Customer module: Home screen, service categories, create service request, choose provider, order tracking, payment, service history
- Service Provider module: Dashboard with stats, job requests (accept/reject), active jobs, completed jobs, earnings
- Admin panel: Dashboard stats, providers list with approval/membership management, customers list, work orders monitor, payments monitor, membership management
- Smart features: Gold-first provider sorting, location-based provider matching, analytics charts
- Mobile-first UI: bottom navigation, card-based listings, membership badges, status chips

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan

### Backend (Motoko)
- User auth with role field (admin/customer/provider)
- ServiceProvider CRUD with ApprovalStatus, MembershipType, Status fields
- CustomersDtls CRUD with BaseLocation
- WorkOrderDtls CRUD with full status flow (Requested/Accepted/In Progress/Completed/Cancelled)
- CustomerPayments CRUD with PaymentMode and PaymentStatus
- Query: providers filtered by serviceArea + sorted by MembershipType (Gold first)
- Query: work orders by customerID, providerID, status
- Query: admin aggregates (counts, revenue)
- Auto-generate CustomerID (CUST-XXXX) and ProviderID (PROV-XXXX)

### Frontend
- Auth screens: Login, Register (with role select), OTP Verification
- Role-based routing: Customer, Provider, Admin dashboards
- Customer: Home (4 service category cards), Create Request form, Provider chooser list, Order Tracking, Payment screen, History
- Provider: Dashboard stats cards, Job Requests list, Active Jobs, Completed Jobs, Earnings
- Admin: Stats dashboard with charts, Providers management table, Customers table, Work Orders table with filters, Payments table, Membership management
- Bottom navigation bar for mobile
- Membership badges (Gold/Silver/Bronze color coded)
- Status chips with color coding
- Location filter dropdown UI
