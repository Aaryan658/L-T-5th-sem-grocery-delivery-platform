# Hoppscotch Screenshot Runbook — API Testing Evidence (CIA-3)

Produce the ~21 request/response screenshots for `docs/screenshots/`.
Every step below was **dry-run against the live backend** on 2026-09-08 — the
expected status codes and response messages are what the server actually returned.

---

## 0. Prerequisites (do this once, in order)

1. **Backend running** on port 5000. In `grocery-delivery-platform/backend`:
   ```bash
   npm run dev
   ```
   Wait for `MongoDB connected` + `Server listening on port 5000`.

2. **Fresh seed** (already done for you at the end of the dry-run, but re-run if
   you have touched the DB since):
   ```bash
   npm run seed
   ```
   Gives: 2 dark-stores, 6 products, and 4 accounts — all password `Passw0rd!`:
   `admin@grocery.test`, `staff@grocery.test`, `customer@grocery.test`,
   `partner@grocery.test`.

3. **Hoppscotch Desktop** → import
   `postman/grocery-delivery-platform.postman_collection.json`
   (Collections ▸ Import ▸ Postman ▸ choose file). You get a collection
   **"P19 - Online Grocery Delivery Platform"** with these collection variables
   already filled:

   | variable | value |
   |---|---|
   | `baseUrl` | `http://localhost:5000/api` |
   | `token` | *(empty — auto-filled by Login/Register)* |
   | `storeId` | *(empty — you set it at step 03)* |
   | `productId` | *(empty — you set it at step 04)* |
   | `orderId` | *(empty — auto-filled by Place Order)* |
   | `deliveryPartnerUserId` | *(empty — you set it after the partner login)* |

### How auth works in this collection
- Every authenticated request already carries the header
  `Authorization: Bearer {{token}}`. You never edit headers.
- **`Auth › Login`** and **`Auth › Register`** each run a test script that saves
  `data.token` into the collection variable `token`. So **switching role = just
  re-send `Auth › Login` with that role's email.**
- **`Orders › Place Order (customer)`** saves `data._id` into `orderId`.
- If your Hoppscotch build does **not** execute the `pm.collectionVariables.set`
  script (check the collection's **Variables** tab after a Login — is `token`
  populated?), then after each Login/Place-Order **copy the value from the
  response and paste it into the variable manually.** Everything else still works.

### Screenshot rule
For each numbered step: send the request, then take **one** screenshot with the
**method + URL + body** panel and the **response (status pill + JSON body)** both
visible, and save as `docs/screenshots/<name>.png` (names in the table).
For **11**, expand the `statusHistory` array so all 6 entries show.

---

## ⚠️ One deviation from the brief — step 05

`GET /stores/:storeId/stock` is **staff/admin-only**. On the customer token it
returns **403**, not 200 (verified). So **step 05 is captured in Phase 2 with the
staff token** — the file is still `05-list-stock-200.png`. It is listed in its
natural place below (Phase 2), not in Phase 1.

Everything else matches the brief exactly.

---

## PHASE 1 — Customer

> Send **`Auth › Login`** with body `customer@grocery.test` / `Passw0rd!` before
> starting (this *is* step 01).

| # | File | Collection request | Do this first | Expect |
|---|---|---|---|---|
| **01** | `01-login-200.png` | `Auth › Login` | body already `customer@grocery.test` / `Passw0rd!` | **200** `Login successful`; `token` now set |
| **02** | `02-register-201.png` | `Auth › Register` | set body to:<br>`{"name":"Viva Test","email":"viva.test@example.com","password":"Passw0rd!","role":"customer"}` | **201** `Registered successfully` |
| — | *(re-send `Auth › Login` for `customer@grocery.test` — step 02 overwrote `token` with the new user's token)* | | | 200 |
| **03** | `03-list-stores-200.png` | `Dark-Stores › List Stores` | — | **200** `Stores fetched successfully`. Copy the **`_id` of "Koramangala Dark Store"** → paste into collection var **`storeId`** |
| **04** | `04-list-products-200.png` | `Products & Store Stock › List Products` | in the **Parameters** tab, **disable** the `category` and `search` query params so the URL is just `{{baseUrl}}/products` | **200** `Products fetched successfully`. Copy **any product `_id`** → paste into **`productId`** |
| **06** | `06-place-order-201.png` | `Orders › Place Order (customer)` | needs `productId` set; body already has `quantity: 2` + the MG Road address | **201** `Order placed successfully`; `orderId` now set. (itemsTotal 132, deliveryFee 30, total 162 with the milk product) |
| **13** | `13-delivery-slots-200.png` | `Delivery Slots › Get Available Delivery Slots` | — | **200** `Available delivery slots` (12 windows, today + tomorrow) |
| **14a** | `14a-order-history-200.png` | `Orders › My Order History` | — | **200** `Order history fetched successfully` (array with your order) |
| **14b** | `14b-reorder-201.png` | `Orders › Reorder` | needs `orderId` | **201** `Order placed successfully` (a **new** `_id`; `orderId` stays the original) |
| **18** | `18-negative-400.png` | `Negative / Edge Cases › 400 - Register Missing Fields` | body already `{"email":"bad@example.com"}` | **400** `"name" is required, "password" is required` |
| **19** | `19-negative-404.png` | `Negative / Edge Cases › 404 - Order With Invalid Id` | URL already `/orders/000000000000000000000000` | **404** `Order not found` |
| **20** | `20-negative-409.png` | `Negative / Edge Cases › 409 - Place Order With Out-of-Stock Quantity` | needs `productId`; body already `quantity: 999999` | **409** `... is out of stock at Koramangala Dark Store (requested 999999, available 46)` |
| **17** | `17-negative-401.png` | `Negative / Edge Cases › 401 - No Token` | this request has **no** Authorization header — leave it that way | **401** `Authentication required` |
| **16** | `16-negative-403.png` | `Negative / Edge Cases › 403 - Customer Calls Admin-Only Report` | still on the customer `token` | **403** `You do not have permission to perform this action` |

---

## PHASE 2 — Store Staff

> Send **`Auth › Login`** with `staff@grocery.test` / `Passw0rd!`. `token` → staff.

| # | File | Collection request | Do this first | Expect |
|---|---|---|---|---|
| **05** | `05-list-stock-200.png` | `Products & Store Stock › List Store Stock` | needs `storeId` set (from step 03) | **200** `Stock fetched successfully` (6 rows, quantities 46/45/40/35/30/25) |
| **07** | `07-pick-order-200.png` | `Orders › Pick Order (Module 5, staff)` | needs `orderId` | **200** `Order moved to picking` — `status: "picking"` |
| **08** | `08-pack-order-200.png` | `Orders › Pack Order (Module 5, staff)` | needs `orderId` | **200** `Order packed successfully` — `status: "packed"`, `packedAt` set |

---

## PHASE 3 — Delivery Partner (id lookup, **no screenshot**)

1. `Auth › Login` with `partner@grocery.test` / `Passw0rd!`.
2. Send `Auth › Get Current User (Me)`.
3. Copy `data.user._id` from the response → paste into collection var
   **`deliveryPartnerUserId`**.

---

## PHASE 4 — Store Staff again (assign)

> Send `Auth › Login` with `staff@grocery.test` / `Passw0rd!`.

| # | File | Collection request | Do this first | Expect |
|---|---|---|---|---|
| **09** | `09-assign-partner-200.png` | `Orders › Assign Delivery Partner (Module 6, staff)` | needs `orderId` + `deliveryPartnerUserId`; body already `{"deliveryPartnerId":"{{deliveryPartnerUserId}}"}` | **200** `Delivery partner assigned successfully` — `status: "assigned"`, `deliveryPartnerId` set |

---

## PHASE 5 — Delivery Partner again (deliver)

> Send `Auth › Login` with `partner@grocery.test` / `Passw0rd!`.

Use the request **`Orders › Update Delivery Status (Module 7, partner)`** for both:

| # | File | Body | Expect |
|---|---|---|---|
| **10a** | *(no screenshot — required intermediate)* | `{"status":"out-for-delivery","note":"Picked up from store"}` (already the default) | **200** `Status updated successfully` — `status: "out-for-delivery"` |
| **10** | `10-status-delivered-200.png` | change body to `{"status":"delivered"}` | **200** `Status updated successfully` — `status: "delivered"`, `deliveredAt` set |

---

## PHASE 6 — Customer again (full timeline)

> Send `Auth › Login` with `customer@grocery.test` / `Passw0rd!`.

| # | File | Collection request | Do this first | Expect |
|---|---|---|---|---|
| **11** | `11-order-full-timeline-200.png` | `Orders › Get Order By Id (Module 8)` | needs `orderId`; **expand `statusHistory` in the response** | **200** `Order fetched successfully` — `statusHistory` shows all 6: `placed → picking → packed → assigned → out-for-delivery → delivered` |

---

## PHASE 7 — Admin (report)

> Send `Auth › Login` with `admin@grocery.test` / `Passw0rd!`.

| # | File | Collection request | Expect |
|---|---|---|---|
| **15** | `15-performance-report-200.png` | `Admin Reports › Store & Delivery Performance Report` | **200** `Performance report generated successfully` — array with `Koramangala Dark Store`: `orderVolume 2, deliveredCount 1, failedCount 0, revenue 162` |

---

## Final checklist — 20 numbered files in `docs/screenshots/`

```
01-login-200.png              11-order-full-timeline-200.png
02-register-201.png           13-delivery-slots-200.png
03-list-stores-200.png        14a-order-history-200.png
04-list-products-200.png      14b-reorder-201.png
05-list-stock-200.png         15-performance-report-200.png
06-place-order-201.png        16-negative-403.png
07-pick-order-200.png         17-negative-401.png
08-pack-order-200.png         18-negative-400.png
09-assign-partner-200.png     19-negative-404.png
10-status-delivered-200.png   20-negative-409.png
```
(Step 10a is an unscreenshotted intermediate. "12" is not in the brief.)

## Gotchas
- **Re-seed before you start.** Steps 02 / 06 / 14b / 20 mutate data. If you re-run
  the whole thing without `npm run seed`, step 02 gives **409** (`viva.test`
  already exists) and stock numbers drift.
- **`orderId` must stay the original order** through Phases 2–7. `Reorder` (14b)
  creates a second order but does **not** change the `orderId` variable — good,
  leave it.
- If a role step returns **401** `Invalid or expired token`, you skipped that
  phase's Login (or the token variable didn't auto-update — paste it manually).
- If **09 assign** returns **409** `partner is not available`, the partner was
  already assigned to another order — re-seed and run the order through once,
  cleanly.
