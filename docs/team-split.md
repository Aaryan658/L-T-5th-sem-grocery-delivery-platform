# Team Ownership - Who Pushes What

This maps the PDF's suggested Sprint-Wise Build Order / Team Role Split onto
the actual files in this repository, so each member knows exactly what to
branch, build, and push. Every member must still be able to explain modules
outside their own ownership area at the viva (per the project brief, Section 7).

**Git workflow:** create one feature branch per module group
(e.g. `feature/auth-and-stores`, `feature/order-workflow`), commit early and
often, push daily (not just before the deadline), and open a PR into `main`
for review before merging. Agree on the shared Mongoose schemas
(`backend/models/`) first, in one sitting, before splitting up - see the
"Risks & Mitigation" table in the project brief.

## Member 1 - Sprint 1: Foundation (Modules 1, 2, 3, 4)

**Owns and pushes:**
- `backend/config/db.js`
- `backend/models/User.js`
- `backend/models/DarkStore.js`
- `backend/models/Product.js`
- `backend/models/StoreStock.js`
- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `backend/validators/authValidators.js`
- `backend/controllers/storeController.js`
- `backend/routes/storeRoutes.js` (store CRUD + `/stores/nearest` sections)
- `backend/validators/storeValidators.js`
- `backend/controllers/productController.js`
- `backend/routes/productRoutes.js`
- `backend/validators/productValidators.js`
- `backend/controllers/stockController.js` (`upsertStock`, `listStock`, `updateStock`)
- `backend/middleware/auth.js`

## Member 2 - Sprint 2: Core Workflow (Modules 5, 6, 7, 8)

**Owns and pushes:**
- `backend/models/Order.js`
- `backend/models/DeliveryPartner.js`
- `backend/controllers/orderController.js` (`pickOrder`, `packOrder`,
  `assignPartner`, `updateStatus`, `getOrder`, `canAccessOrder`)
- `backend/routes/orderRoutes.js` (`/pick`, `/pack`, `/assign`, `/status`, `GET /:id` sections)
- `backend/controllers/deliveryPartnerController.js`
- `backend/routes/deliveryPartnerRoutes.js`
- `backend/validators/orderValidators.js`
- `backend/config/constants.js` (`ORDER_STATUS_FLOW`)

## Member 3 - Sprint 3: Reporting & Polish (Modules 9, 10, 11, 12, 13)

**Owns and pushes:**
- `backend/controllers/stockController.js` (`getReplenishmentAlerts`)
- `backend/utils/slots.js`
- `backend/routes/slotRoutes.js`
- `backend/controllers/orderController.js` (`myOrders`, `reorder`)
- `backend/controllers/reportController.js`
- `backend/routes/reportRoutes.js`
- `backend/middleware/authorize.js`
- `backend/config/constants.js` (`DELIVERY_FEE`, `DELIVERY_SLOT_WINDOWS`, `DEFAULT_REORDER_POINT`)

## Member 4 (if applicable) - Database Schema, Postman, README, PPT

**Owns and pushes:**
- `docs/database-schema.md`
- `docs/team-split.md` (this file)
- `postman/grocery-delivery-platform.postman_collection.json`
- `README.md`
- Final review pass on all files under `backend/models/` (schema consistency,
  index correctness, reference-vs-embed justification)
- `backend/middleware/validate.js`, `errorHandler.js`, `notFound.js`
- `backend/utils/apiResponse.js`, `asyncHandler.js`, `jwt.js`, `hash.js`, `ApiError.js`
- `backend/seed.js`
- `backend/server.js` (integration point wiring every route)
- `backend/.env.example`, `.gitignore`, `backend/package.json`
- `frontend/` (optional demo UI, once every API is stable)
- The PPT presentation itself (external deliverable, not part of the repo)

## If Your Team Has Only 3 Members

Fold Member 4's list into whoever finishes their sprint first - the schema
review, Postman collection, and README should still each have a clear single
owner for the final pass, even if everyone contributes endpoints to the
Postman collection as they build them.
