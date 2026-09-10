# START HERE — Member 1

**Name:** Abhay Job K J  **Roll No:** 2460485  **Section:** 5 BTCS B
**Your branch:** `feature/m1-auth-stores`
**Your sprint:** Sprint 1 — Foundation (Modules 1, 2, 3, 4)

This zip contains **only the files you personally commit and push**, laid out
at their real repo paths inside `grocery-delivery-platform/`. The other members'
code, `node_modules`, and the rest of the project are **not** here — you get
those by cloning the team's GitHub repo. Workflow: clone the repo, copy the
files from this zip over your clone (keeping the paths), then commit and push
just these from your own GitHub account.

---

## 1. What YOU commit and push

You own **auth + the two admin master resources + order placement**, plus the
app-bootstrap and auth-infra files this sprint stands up first.

- `backend/server.js` — app entry point, wires every route together
- `backend/config/db.js` — Mongo connection
- `backend/config/constants.js` — `DELIVERY_FEE`, `FREE_DELIVERY_THRESHOLD` (used by order placement)
- `backend/middleware/auth.js` — JWT verify, needed by every protected route
- `backend/utils/jwt.js`, `backend/utils/hash.js`
- `backend/controllers/authController.js` + `routes/authRoutes.js` + `validators/authValidators.js`
- `backend/controllers/storeController.js` + `routes/storeRoutes.js` + `validators/storeValidators.js`
- `backend/controllers/productController.js` + `routes/productRoutes.js` + `validators/productValidators.js`
- `backend/controllers/stockController.js` — the `upsertStock`, `listStock`, `updateStock` functions only
- `backend/controllers/orderController.js` — the `placeOrder` function + `canAccessOrder` helper (Module 4) only
- Project root: `.gitignore`, `backend/package.json`, `backend/.env.example`

`constants.js`, `stockController.js` and `orderController.js` are shared with
other members — commit **only your functions/values** in those files, with a
message that names your module, e.g. `feat(m1): JWT auth + register/login`.

---

## 2. Set up the project (run these in your clone of the team repo, not in this zip)

### Prerequisites
- Node.js 18+ and npm  — https://nodejs.org
- MongoDB — a local install **or** a free MongoDB Atlas cluster

### Install
```bash
cd grocery-delivery-platform/backend
npm install
```

### Configure environment
The real `.env` is **not** included in this zip (it holds a private database
password). Create your own:
```bash
cp .env.example .env
```
Then edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/grocery_delivery
PORT=5000
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=1d
SALT_ROUNDS=10
```
- Local MongoDB: keep the `127.0.0.1` URI above and start the MongoDB service.
- Atlas: paste your `mongodb+srv://...` string instead. Ask Aaryan for the
  shared team cluster string if you want the same demo data as everyone.

### Seed demo data (recommended)
```bash
npm run seed
```
Creates 2 stores, 6 products with stock, and one login per role
(password `Passw0rd!` for all): `admin@grocery.test`, `staff@grocery.test`,
`customer@grocery.test`, `partner@grocery.test`.

### Run
```bash
npm run dev      # auto-restarts on change
# or: npm start
```
API: `http://localhost:5000/api`  •  demo UI: `http://localhost:5000/`

Console should print:
```
MongoDB connected: grocery_delivery
Server listening on port 5000
```

### Test with Postman
Import `grocery-delivery-platform/postman/grocery-delivery-platform.postman_collection.json`.
Set collection variable `baseUrl` to `http://localhost:5000/api`, run
**Auth > Login** first — the token is captured automatically.

---

## 3. Git workflow

```bash
git clone <team-repo-url>
cd grocery-delivery-platform
git checkout -b feature/m1-auth-stores

# copy your files from this zip over the clone, keeping paths:
#   PowerShell:  Copy-Item -Recurse -Force <extracted>\grocery-delivery-platform\* .

# stage ONLY your files (example)
git add backend/server.js backend/config/db.js backend/config/constants.js \
        backend/middleware/auth.js backend/utils/jwt.js backend/utils/hash.js \
        backend/controllers/authController.js backend/routes/authRoutes.js \
        backend/validators/authValidators.js
git commit -m "feat(m1): app bootstrap + JWT auth"
git push -u origin feature/m1-auth-stores
```
Then open a Pull Request into `main` on GitHub and let a teammate review it.

**Rules (rubric):**
- Commit from **your own GitHub account**, on **your own branch**.
- Several small commits across multiple days beats one big commit at the end.
- Member 4 pushes the `models/` folder first; build against that schema.

---

## 4. Viva reminder
You must be able to explain modules **outside** your own area too
(project brief, Section 7). Read `README.md` and `docs/database-schema.md`.
