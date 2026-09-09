# Database Schema & ER Notes

## Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | Every account: customer, storeStaff, deliveryPartner, admin | name, email (unique), passwordHash, role, storeId (staff only), addresses[] (embedded) |
| `darkStores` | Fulfilment locations | name (unique), area, serviceablePincodes[] (embedded), location |
| `products` | Master catalog, store-agnostic | name, category, unit, price |
| `storeStock` | Per-store quantity for each product | storeId (ref), productId (ref), quantity, reorderPoint |
| `orders` | The unified order pipeline | customerId (ref), storeId (ref), deliveryPartnerId (ref), items[] (embedded snapshot), pricing (embedded), status, statusHistory[] (embedded) |
| `deliveryPartners` | Operational profile for a deliveryPartner user | userId (ref, unique), vehicleType, isAvailable, currentStoreId (ref) |

## Reference vs. Embed Reasoning

| Data | Choice | Why |
|---|---|---|
| `order.items[]` | Embedded | Always read with the order; price/name are frozen as a snapshot of the moment of purchase so a later catalog price change never rewrites a past invoice; never queried on their own. |
| `order.pricing`, `order.deliverySlot` | Embedded | Small, single-purpose, only ever meaningful attached to their one order. |
| `order.statusHistory[]` | Embedded | Small append-only audit trail; always read together with the order to render its timeline (Module 8). |
| `user.addresses[]` | Embedded | Small, rarely updated independently, always needed inline when the user places an order. |
| `darkStore.serviceablePincodes[]` | Embedded | The nearest-store check needs the whole list in one read; edited only alongside the store itself. |
| `storeStock` (storeId, productId) | Referenced (both ways) | Large in aggregate, queried independently of both parents ("what is low at store X", "which stores carry product Y"), and updated on its own every time an order is placed/picked - embedding into either parent would mean rewriting a whole store or product document for a single quantity change. |
| `deliveryPartners.userId` | Referenced | `isAvailable` is a write-hot field that changes every assignment/delivery; assignment queries scan this collection alone without needing the rest of the user profile. |
| `order.customerId` / `storeId` / `deliveryPartnerId` | Referenced | Shared across many orders, updated independently of any single order. |

## Indexes

| Collection | Index | Reason |
|---|---|---|
| `users` | `{ email: 1 }` unique | Enforces uniqueness, speeds up login lookups |
| `users` | `{ role: 1, storeId: 1 }` | Speeds up "staff of store X" lookups |
| `darkStores` | `{ name: 1 }` unique | Prevents duplicate store names |
| `darkStores` | `{ serviceablePincodes: 1 }` | Speeds up the nearest-store-by-pincode check |
| `products` | `{ name: 1 }`, `{ category: 1 }` | Speeds up catalog browsing/search |
| `storeStock` | `{ storeId: 1, productId: 1 }` unique | One stock row per store/product pair, prevents duplicate rows under a race |
| `storeStock` | `{ productId: 1 }` | "Which stores carry this product" queries |
| `orders` | `{ customerId: 1, createdAt: -1 }` | Customer order history (Module 11) |
| `orders` | `{ storeId: 1, status: 1, createdAt: -1 }` | Store picking queue + performance report (Modules 5, 12) |
| `orders` | `{ deliveryPartnerId: 1, status: 1 }` | A partner's active deliveries (Modules 6, 7) |
| `deliveryPartners` | `{ userId: 1 }` unique | One partner profile per user |
| `deliveryPartners` | `{ isAvailable: 1, currentStoreId: 1 }` | Assignment queries (Module 6) |

## Data Relationships (ER Notes)

```
users (1) ----< storeStock created/updated by (many, via storeId scoping)
users (1, role=storeStaff) ---- belongs to ---- (1) darkStores
users (1, role=customer)  ---- places ------< (many) orders
users (1, role=deliveryPartner) ---- has ---- (1) deliveryPartners profile
darkStores (1) ---- stocks ------------< (many) storeStock rows
darkStores (1) ---- fulfils ------------< (many) orders
products (1) ---- appears in ----------< (many) storeStock rows
products (1) ---- snapshotted into ----< (many) order.items[] (embedded, not a live ref at read time)
orders (1) ---- assigned to ------------ (1) deliveryPartners (via deliveryPartnerId -> users)
```

Draw this as boxes-and-arrows in the PPT: six collection boxes, solid arrows
for `ref` relationships (users -> darkStores, storeStock -> darkStores/products,
orders -> users/darkStores/deliveryPartners), and a dashed box inside `orders`
showing the embedded `items[]`, `pricing`, `deliverySlot`, and `statusHistory[]`
sub-documents to make the embed-vs-reference decision visible at a glance.
