# P19 - Online Grocery Delivery Platform

**Domain:** Quick Commerce / Grocery
**Course:** CIA-3 Project Development, 5th Semester, Christ University

## Team Details

| Name | Roll No | Department | Section |
|---|---|---|---|
| A Aaryan Dharrmik | 2460301 | B. Tech CSE | 5 BTCS B |
| Abhishek R | 2460307 | B. Tech CSE | 5 BTCS B |
| Adriel B John | 2460314 | B. Tech CSE | 5 BTCS B |
| Abhay Job K J | 2460485 | B. Tech CSE | 5 BTCS B |



## Problem Statement

Quick-commerce grocery delivery needs a backend that lets customers order daily
essentials for home delivery, lets dark-store staff pick and pack those orders
from live per-store inventory, and lets delivery partners handle last-mile
delivery, all tracked through one unified order pipeline with role-based
access for Customer, Store Staff, Delivery Partner, and Admin.

## Tech Stack Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (jsonwebtoken) + bcrypt password hashing
- **Validation:** Joi (all request bodies validated before hitting business logic)
- **Docs/Testing:** Postman collection (`postman/grocery-delivery-platform.postman_collection.json`)
- **Optional frontend:** Vanilla HTML/CSS/JS demo in `frontend/` that exercises every role's flow live

## Project Folder Structure

```
grocery-delivery-platform/
  backend/
    config/         -> db.js (MongoDB connection), constants.js (business constants)
    models/         -> Mongoose schemas, one file per collection
    routes/         -> Express route definitions, grouped by resource
    controllers/    -> business logic for each route
    middleware/     -> auth.js (JWT verify), authorize.js (RBAC), validate.js, errorHandler.js, notFound.js
    validators/     -> Joi schemas per resource
    utils/          -> jwt, hash, apiResponse, asyncHandler, slots, ApiError
    seed.js         -> populates demo data (stores, products, stock, one user per role)
    server.js       -> app entry point
    package.json
    .env.example    -> sample environment variables (no real secrets)
  frontend/         -> optional static demo UI (served by the backend at /)
  postman/          -> exported Postman collection covering every endpoint
  docs/             -> ER notes and team ownership split
  README.md
```

## Setup Instructions

### 1. Install prerequisites

- Node.js 18+ and npm
- MongoDB (a local install, or a free MongoDB Atlas cluster)

### 2. Install dependencies

```bash
cd grocery-delivery-platform/backend
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

`.env` must define:

```
MONGO_URI=mongodb://127.0.0.1:27017/grocery_delivery
PORT=5000
JWT_SECRET=replace-this-with-a-long-random-string
JWT_EXPIRES_IN=1d
SALT_ROUNDS=10
```

See **MongoDB Setup** below for how to get a working `MONGO_URI`, either
locally or on Atlas.

### 4. Seed demo data (recommended for a fast first run)

```bash
npm run seed
```

This creates two dark-stores, six products with per-store stock, and one
login for every role (password `Passw0rd!` for all):

| Role | Email |
|---|---|
| Admin | admin@grocery.test |
| Store Staff (Koramangala) | staff@grocery.test |
| Customer | customer@grocery.test |
| Delivery Partner | partner@grocery.test |

### 5. Run the server

```bash
npm run dev     # nodemon, auto-restarts on change
# or
npm start
```

The API is now live at `http://localhost:5000/api`, and the optional demo
frontend is served at `http://localhost:5000/`.

### 6. Import the Postman collection

Import `postman/grocery-delivery-platform.postman_collection.json` into
Postman. Set the collection variable `baseUrl` to `http://localhost:5000/api`,
then run **Auth > Login** - the token is captured automatically into the
`{{token}}` variable for every subsequent request.

## MongoDB Setup (Detailed)

You can point `MONGO_URI` at either a local MongoDB or a free MongoDB Atlas
cluster - the app does not care which, as long as the connection string is
valid.

### Option A - Local MongoDB (fastest for development)

1. Install MongoDB Community Server for your OS from
   https://www.mongodb.com/try/download/community (or `brew install mongodb-community`
   on macOS, or the equivalent package for your Linux distro).
2. Start the MongoDB service:
   - Windows: MongoDB installs as a service and usually starts automatically;
     otherwise run `net start MongoDB` from an elevated prompt, or run
     `mongod --dbpath "C:\data\db"` directly.
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
3. Use this connection string in `.env`:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/grocery_delivery
   ```
   No username/password is needed for a default local install.
4. (Optional) Install **MongoDB Compass** (GUI) to browse collections
   visually while developing.

### Option B - MongoDB Atlas (free cloud cluster, no local install)

1. Create a free account at https://www.mongodb.com/cloud/atlas/register.
2. Create a new **free M0 cluster** (any provider/region).
3. Under **Database Access**, add a database user with a username and
   password (Atlas admin role is fine for a class project).
4. Under **Network Access**, add your current IP (or `0.0.0.0/0` for
   convenience during development/demo only).
5. Click **Connect > Drivers**, copy the connection string, and put it in
   `.env` with your real username/password and a database name appended:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/grocery_delivery?retryWrites=true&w=majority
   ```
6. Never commit this string - `.env` is already git-ignored. Only
   `.env.example` (with placeholder values) is committed.

### Verifying the connection

Run `npm run dev` and confirm the console prints:

```
MongoDB connected: grocery_delivery
Server listening on port 5000
```

If it instead prints a connection error, double-check the URI, that your IP
is allow-listed (Atlas), and that the database user's password does not
contain characters that need URL-encoding (`@`, `#`, `%`, etc.).

## List of Implemented Modules

| # | Module | Status |
|---|---|---|
| 1 | User Registration & Authentication | Implemented |
| 2 | Dark-Store Management | Implemented |
| 3 | Product Catalog & Store-Wise Stock | Implemented |
| 4 | Order Placement with Nearest-Store Check | Implemented |
| 5 | Order Picking & Packing Workflow | Implemented |
| 6 | Delivery Partner Assignment | Implemented |
| 7 | Delivery Status Tracking | Implemented |
| 8 | Real-Time Order Status for Customer | Implemented |
| 9 | Stock Replenishment Alerts | Implemented |
| 10 | Delivery Time Slot Selection | Implemented |
| 11 | Customer Order History & Reorder | Implemented |
| 12 | Store & Delivery Performance Reports | Implemented |
| 13 | Role-Based Access Control | Implemented |

## API Endpoint Reference

All responses follow one envelope:

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "...", "errorCode": "VALIDATION_ERROR" }
```

### Auth (Module 1)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register customer/staff/partner/admin |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Any | Current authenticated user |

### Dark-Stores (Module 2) & Store Stock (Module 3, 9)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/stores | Admin | Create a dark-store |
| GET | /api/stores | Any | List dark-stores |
| GET | /api/stores/:id | Any | Get one store |
| PUT | /api/stores/:id | Admin | Update a store |
| DELETE | /api/stores/:id | Admin | Deactivate a store (soft delete) |
| GET | /api/stores/nearest?pincode= | Any | Nearest-store check by pincode |
| POST | /api/stores/:storeId/stock | Admin/Staff | Upsert stock for a product |
| GET | /api/stores/:storeId/stock | Admin/Staff | List a store's stock |
| PUT | /api/stores/:storeId/stock/:productId | Admin/Staff | Update quantity/reorderPoint |
| GET | /api/stores/:storeId/stock/alerts | Admin/Staff | Items at/below reorderPoint |
| GET | /api/stores/:storeId/orders?status= | Admin/Staff | Store picking/packing queue |

### Products (Module 3)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/products | Admin | Create a product |
| GET | /api/products?category=&search= | Any | Browse/search products |
| GET | /api/products/:id | Any | Get one product |
| PUT | /api/products/:id | Admin | Update a product |
| DELETE | /api/products/:id | Admin | Deactivate a product |

### Orders (Modules 4-8, 11)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/orders | Customer | Place an order (nearest-store + stock check) |
| GET | /api/orders/:id | Owner/Staff/Partner/Admin | Real-time order status + history |
| GET | /api/orders/my | Customer | Order history |
| POST | /api/orders/:id/reorder | Customer | Reorder a past order |
| PUT | /api/orders/:id/pick | Staff/Admin | Mark items being picked |
| PUT | /api/orders/:id/pack | Staff/Admin | Mark order packed |
| PUT | /api/orders/:id/assign | Staff/Admin | Assign a delivery partner |
| PUT | /api/orders/:id/status | Partner/Admin | Update delivery status |

### Delivery Partners (Module 6, 7)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/delivery-partners/available?storeId= | Staff/Admin | List available partners |
| GET | /api/delivery-partners/me | Partner | My partner profile |
| PUT | /api/delivery-partners/me/availability | Partner | Toggle availability |

### Delivery Slots (Module 10)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/slots | Any | Bookable delivery windows (today/tomorrow) |

### Admin Reports (Module 12)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/admin/reports/performance | Admin | Per-store order volume, avg pick/delivery time, revenue |

### Sample Request/Response

`POST /api/orders`

```json
{
  "pincode": "560034",
  "items": [{ "productId": "<productId>", "quantity": 2 }],
  "deliveryAddress": { "line1": "12 MG Road", "area": "Koramangala", "pincode": "560034" }
}
```

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": { "_id": "...", "status": "placed", "pricing": { "itemsTotal": 132, "deliveryFee": 30, "totalAmount": 162 } }
}
```

Error example (any endpoint, validation/business-rule failure):

```json
{ "success": false, "message": "Amul Toned Milk 1L is out of stock at Koramangala Dark Store (requested 5, available 2)", "errorCode": "OUT_OF_STOCK" }
```

## Database Schema Summary

Collections: `users`, `darkStores`, `products`, `storeStock`, `orders`, `deliveryPartners`.
Full field list, indexes, and the reference-vs-embed reasoning behind each
collection are in [`docs/database-schema.md`](docs/database-schema.md) and as
inline comments in every file under `backend/models/`.

In short:

- **Referenced** (separate collections, joined by ObjectId): `users`, `darkStores`,
  `products`, `storeStock`, `deliveryPartners`, and the `customerId` /
  `storeId` / `deliveryPartnerId` fields on `orders` - all shared across many
  documents and updated independently of any one order.
- **Embedded** (sub-documents that live inside their parent): `order.items[]`,
  `order.pricing`, `order.deliverySlot`, `order.statusHistory[]`,
  `user.addresses[]`, `darkStore.serviceablePincodes[]` - all small,
  always read together with their parent, and frozen as a snapshot in the
  order's case so a later price/catalog change never rewrites a past invoice.

## Role-Based Access Control (Module 13)

Enforced in two layers:
1. `middleware/auth.js` - verifies the JWT and attaches the live user record.
2. `middleware/authorize(...roles)` - route-level allow-list per role.
3. Record-level checks inside `orderController.js` (`canAccessOrder`) - a
   customer can only ever see their own orders, staff only their own store's
   orders, and a delivery partner only the order currently assigned to them.

## Known Limitations

- Stock is decremented at order placement (not at pack time) for simplicity;
  a cancelled/failed order does not currently restock automatically.
- Stock decrements run as sequential `updateOne` calls rather than inside a
  MongoDB multi-document transaction, since a single-node local MongoDB
  install has no replica set. On Atlas (which is always a replica set) this
  could be upgraded to a transaction with no other code changes.
- Payment, SMS/email notifications, and maps/geolocation are out of scope and
  are not mocked beyond the nearest-store-by-pincode lookup, per the
  project's stated Scope & Boundaries.
- Delivery slot capacity is not tracked (a slot can be selected by unlimited
  customers) - only the customer's own preferred window is recorded.
- The frontend is a minimal demo (not a polished consumer UI); it exists to
  make the live API demo easier to follow, per the recommended tech stack
  note that visual polish is not evaluated for CIA-3.

## Team Ownership (who pushes what)

See [`docs/team-split.md`](docs/team-split.md) for the full per-member file
list agreed for this repository.
