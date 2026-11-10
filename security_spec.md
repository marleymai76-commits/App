# Security Specifications & Threat Vector Analysis (Zero-Trust ABAC)

This security specification addresses threat models, invariants, and payloads targeting our Firestore schemas for Users, Promotions, Tables, and Orders.

## 1. Core Data Invariants
- **User Integrity**: A user document (`/users/{userId}`) can only be created by the authenticated owner of the matching `userId`. The `role` and specific privilege fields cannot be altered by the user themselves unless verified by an admin look-up.
- **Promotion Integrity**: Only users authenticated with authorized roles (`admin`, `manager`) can write to the `/promotions` collection. `userId` must match the authenticated user, and immutable fields like `createdAt` cannot be modified.
- **Table Integrity**: Only restaurant staff (`admin`, `manager`, `waiter`, `cashier`) can read and manage table statuses. High-security state transitions are verified to keep tables from arbitrary state alterations.
- **Order Integrity**: Order records require valid relational references (e.g. valid `tableId`) and can only have specific progressive state-changes (`pending` -> `preparing` -> `ready` -> `delivered` -> `paid`).

## 2. The "Dirty Dozen" Vulnerability Payload Tests
These represent standard vector patterns attempting shadow updates, identity spoofing, state shortcuts, and validation bypasses.

1. **User Identity Spoofing**: Attempting to register or modify another user's UID profile.
2. **Role Privilege Escalation**: A standard client attempts to update their own `role` field to `admin`.
3. **Empty Field Injection**: Attempting to write a user profile without a `name` or `email` payload.
4. **Promotion Hijack**: A non-staff client attempts to write a promotion document.
5. **Promotion Origin Spoof**: A staff member attempts to create a promotion where `userId` is set to different user's UID.
6. **Promotion Negative Value**: Attempting to post a promotion with a negative percentage or value.
7. **Promotion Immutable Mutation**: Updating a promotion with a different `createdAt` timestamp.
8. **Table State Corruption**: A public user attempts to update table statuses to cause a denial of wallet or fake occupation.
9. **Order Client Hijacking**: A customer attempts to delete or alter an order value or items once submitted.
10. **Order Progress Bypass**: Altering order status to `paid` bypasses kitchen preparation steps.
11. **Cost Recursion Denial**: Flooding string elements with 10MB byte payloads to exhaust system limits.
12. **Timestamp Forgery**: Passing client-side system clock timestamp instead of server-time request timestamps.

## 3. Draft Rules (DRAFT_firestore.rules)
Created the draft rules to reflect the secure validators.
