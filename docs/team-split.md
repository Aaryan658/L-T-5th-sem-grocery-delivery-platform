# Team Ownership - Who Pushes What

This maps the PDF's suggested Sprint-Wise Build Order / Team Role Split onto
the actual files in this repository, so each member knows exactly what to
branch, build, and push. It follows the brief's split faithfully: Members 1-3
own their sprint's modules (and the glue code those modules need), and
**Member 4 owns the database schema (the whole `models/` folder), the Postman
collection, the README, and the PPT** - which is a real, substantial chunk,
not just cleanup.

Every member must still be able to explain modules outside their own
ownership area at the viva (per the project brief, Section 7).

**Git workflow:** create one feature branch per member (e.g.
`feature/m1-auth-stores`, `feature/m2-order-workflow`, `feature/m4-schema-docs`),
commit early and often, push daily (not just before the deadline), and open a
PR into `main` for review before merging. Member 4 pushes the `models/` folder
FIRST, in one sitting, so everyone else builds against a stable schema - see
the "Risks & Mitigation" table in the project brief.

---

## Member 1 - Sprint 1: Foundation (Modules 1, 2, 3, 4)

Auth + the two admin-managed master resources + order placement, plus the
app-bootstrap and auth-infra files this sprint stands up first.

**Owns and pushes:**
- `backend/server.js` (app entry point - wires every route together)
- `backend/config/db.js` (Mongo connection)
- `backend/config/constants.js` (`DELIVERY_FEE`, `FREE_DELIVERY_THRESHOLD` - used by order placement)
- `backend/middleware/auth.js` (JWT verify - needed by every protected route)
- `backend/utils/jwt.js`, `backend/utils/hash.js`
- `backend/controllers/authController.js` + `routes/authRoutes.js` + `validators/authValidators.js`
- `backend/controllers/storeController.js` + `routes/storeRoutes.js` + `validators/storeValidators.js`
- `backend/controllers/productController.js` + `routes/productRoutes.js` + `validators/productValidators.js`
- `backend/controllers/stockController.js` - the `upsertStock`, `listStock`, `updateStock` functions
- `backend/controllers/orderController.js` - the `placeOrder` function + `canAccessOrder` helper (Module 4)
- Project root: `.gitignore`, `backend/package.json`, `backend/.env.example`

## Member 2 - Sprint 2: Core Workflow (Modules 5, 6, 7, 8)

The order state machine and delivery-partner side, plus the error-handling
infra the workflow guards depend on.

**Owns and pushes:**
- `backend/controllers/orderController.js` - the `pickOrder`, `packOrder`, `assignPartner`,
  `updateStatus`, `getOrder` functions + the `assertTransition` / `pushStatus` helpers
- `backend/routes/orderRoutes.js` (the `/pick`, `/pack`, `/assign`, `/status`, `GET /:id` routes)
- `backend/validators/orderValidators.js`
- `backend/controllers/deliveryPartnerController.js` + `routes/deliveryPartnerRoutes.js`
- `backend/config/constants.js` - the `ORDER_STATUS_FLOW` map (the legal-transitions table)
- `backend/middleware/errorHandler.js` (centralized error handler)
- `backend/middleware/notFound.js`
- `backend/utils/asyncHandler.js`, `backend/utils/ApiError.js`

## Member 3 - Sprint 3: Reporting & Polish (Modules 9, 10, 11, 12, 13)

Alerts, slots, history/reorder, the aggregation report, RBAC, plus the demo
data and demo frontend.

**Owns and pushes:**
- `backend/controllers/stockController.js` - the `getReplenishmentAlerts` function (Module 9)
- `backend/utils/slots.js` + `backend/routes/slotRoutes.js` (Module 10)
- `backend/config/constants.js` - the `DELIVERY_SLOT_WINDOWS`, `DEFAULT_REORDER_POINT` values
- `backend/controllers/orderController.js` - the `myOrders`, `reorder` functions (Module 11)
- `backend/controllers/reportController.js` + `backend/routes/reportRoutes.js` (Module 12)
- `backend/middleware/authorize.js` (role-based access control - Module 13)
- `backend/middleware/validate.js` (Joi wrapper - the validation NFR)
- `backend/utils/apiResponse.js` (the shared success/error envelope)
- `backend/seed.js` (demo data)
- `frontend/` - `index.html`, `styles.css`, `app.js` (the optional demo UI)

## Member 4 - Database Schema, API Docs, Postman, PPT

The data layer and every deliverable document. This is a full quarter of the
work, not a leftover role.

**Owns and pushes:**
- `backend/models/User.js`
- `backend/models/DarkStore.js`
- `backend/models/Product.js`
- `backend/models/StoreStock.js`
- `backend/models/Order.js`
- `backend/models/DeliveryPartner.js`
  (all six Mongoose schemas - field types, indexes, and every embed-vs-reference
  decision, documented inline and in `docs/database-schema.md`)
- `docs/database-schema.md` (ER notes, collection tables, index rationale)
- `docs/team-split.md` (this file)
- `postman/grocery-delivery-platform.postman_collection.json` (every endpoint,
  happy path + the 401/403/404/409 negative cases)
- `README.md` (project title, team details, module list, setup steps, full API
  endpoint reference, DB schema summary, known limitations)
- The PPT presentation (external deliverable, not part of the repo)

Because everyone else builds against these schemas, Member 4's first commit
(the `models/` folder + a first draft of `database-schema.md`) should land on
day one, before Members 1-3 start their controllers.

---

## Keeping the commit history balanced (rubric requirement)

The brief checks that commit history "reflects contribution from multiple
team members, not all commits from a single account." To satisfy that:

- Every member commits **from their own GitHub account** on their **own branch** -
  do not have one person paste everyone's code and push it.
- `orderController.js` is touched by Members 1, 2, and 3 (different functions) -
  that's fine and expected; each commits only their own functions, with a
  message naming the module (e.g. `feat(m2): pick/pack order state transitions`).
- Aim for several small commits per member across multiple days rather than one
  big commit each at the end.
- Member 4's schema + docs + Postman commits are spread across the whole
  timeline (schema early, Postman as endpoints land, README last), so their
  history looks active throughout, not just at submission.

## If Your Team Has Only 3 Members

Fold Member 4's list into whoever finishes their sprint first, but keep one
named owner for each of: the schema (`models/` + `database-schema.md`), the
Postman collection, and the README - even though everyone adds their own
endpoints to the Postman collection as they build them.
