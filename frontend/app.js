const API_BASE = "/api";
let state = { token: null, user: null };

const messageEl = document.getElementById("message");
const showMessage = (text, ok = true) => {
  messageEl.textContent = text;
  messageEl.className = "message " + (ok ? "success" : "error");
};

const api = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = "Bearer " + state.token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || ("Request failed (" + res.status + ")"));
  }
  return data.data;
};

// ---------- Auth / tabs ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".form").forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value,
      }),
    });
    onAuthenticated(data);
  } catch (err) {
    showMessage(err.message, false);
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const role = document.getElementById("regRole").value;
    const body = {
      name: document.getElementById("regName").value.trim(),
      email: document.getElementById("regEmail").value.trim(),
      password: document.getElementById("regPassword").value,
      phone: document.getElementById("regPhone").value.trim(),
      role,
    };
    if (role === "storeStaff") body.storeId = document.getElementById("regStoreId").value.trim();

    const data = await api("/auth/register", { method: "POST", body: JSON.stringify(body) });
    onAuthenticated(data);
  } catch (err) {
    showMessage(err.message, false);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  state = { token: null, user: null };
  document.getElementById("authView").hidden = false;
  document.getElementById("logoutBtn").hidden = true;
  document.getElementById("whoami").textContent = "";
  ["customerView", "staffView", "partnerView", "adminView"].forEach((id) => (document.getElementById(id).hidden = true));
  showMessage("Logged out", true);
});

function onAuthenticated(data) {
  state.token = data.token;
  state.user = data.user;
  document.getElementById("authView").hidden = true;
  document.getElementById("logoutBtn").hidden = false;
  document.getElementById("whoami").textContent = data.user.name + " (" + data.user.role + ")";
  showMessage("Welcome, " + data.user.name, true);

  ["customerView", "staffView", "partnerView", "adminView"].forEach((id) => (document.getElementById(id).hidden = true));

  if (data.user.role === "customer") {
    document.getElementById("customerView").hidden = false;
    loadSlots();
    loadMyOrders();
  } else if (data.user.role === "storeStaff") {
    document.getElementById("staffView").hidden = false;
    loadStaffOrders();
    loadAlerts();
  } else if (data.user.role === "deliveryPartner") {
    document.getElementById("partnerView").hidden = false;
  } else if (data.user.role === "admin") {
    document.getElementById("adminView").hidden = false;
    loadReport();
  }
}

// ---------- Customer: browse + cart + checkout ----------
let currentStore = null;
let cart = {}; // productId -> { product, quantity }

document.getElementById("findStoreBtn").addEventListener("click", async () => {
  try {
    const pincode = document.getElementById("custPincode").value.trim();
    currentStore = await api("/stores/nearest?pincode=" + encodeURIComponent(pincode));
    document.getElementById("storeResult").textContent = "Serving from: " + currentStore.name + " (" + currentStore.area + ")";
    const products = await api("/products");
    renderProducts(products);
  } catch (err) {
    showMessage(err.message, false);
  }
});

function renderProducts(products) {
  const grid = document.getElementById("productList");
  grid.innerHTML = "";
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML =
      "<strong>" + p.name + "</strong>" +
      "<span>" + p.category + "</span>" +
      "<span class=\"price\">Rs " + p.price + " / " + p.unit + "</span>" +
      "<input type=\"number\" min=\"1\" value=\"1\" data-id=\"" + p._id + "\" />" +
      "<button data-add=\"" + p._id + "\">Add to Cart</button>";
    grid.appendChild(card);
    card.querySelector("button").addEventListener("click", () => {
      const qty = parseInt(card.querySelector("input").value, 10) || 1;
      cart[p._id] = { product: p, quantity: qty };
      renderCart();
    });
  });
}

function renderCart() {
  const list = document.getElementById("cartList");
  const items = Object.values(cart);
  if (items.length === 0) {
    list.innerHTML = "<p class=\"hint\">Cart is empty</p>";
    return;
  }
  list.innerHTML = items
    .map((i) => i.product.name + " x " + i.quantity + " = Rs " + i.product.price * i.quantity)
    .join("<br/>");
}

async function loadSlots() {
  try {
    const slots = await api("/slots");
    const sel = document.getElementById("slotSelect");
    sel.innerHTML = "<option value=\"\">No preference</option>";
    slots.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = JSON.stringify(s);
      opt.textContent = s.date + " " + s.startTime + "-" + s.endTime;
      sel.appendChild(opt);
    });
  } catch (err) {
    // slots are optional; ignore failure silently in the demo UI
  }
}

document.getElementById("placeOrderBtn").addEventListener("click", async () => {
  try {
    const items = Object.values(cart).map((i) => ({ productId: i.product._id, quantity: i.quantity }));
    if (items.length === 0) throw new Error("Add at least one product to the cart first");

    const pincode = document.getElementById("custPincode").value.trim();
    const line1 = document.getElementById("addrLine1").value.trim() || "Default address";
    const slotRaw = document.getElementById("slotSelect").value;

    const body = {
      pincode,
      items,
      deliveryAddress: { line1, area: "", pincode },
    };
    if (slotRaw) body.deliverySlot = JSON.parse(slotRaw);

    const order = await api("/orders", { method: "POST", body: JSON.stringify(body) });
    showMessage("Order placed! Total Rs " + order.pricing.totalAmount, true);
    cart = {};
    renderCart();
    loadMyOrders();
  } catch (err) {
    showMessage(err.message, false);
  }
});

document.getElementById("refreshOrdersBtn").addEventListener("click", loadMyOrders);

async function loadMyOrders() {
  try {
    const orders = await api("/orders/my");
    const list = document.getElementById("myOrdersList");
    list.innerHTML = orders
      .map(
        (o) =>
          "<div class=\"order-card\">" +
          "<strong>#" + o._id.slice(-6) + "</strong> - <span class=\"status-pill status-" + o.status + "\">" + o.status + "</span><br/>" +
          "Total: Rs " + o.pricing.totalAmount + " - Items: " + o.items.map((i) => i.name + " x" + i.quantity).join(", ") +
          "<br/><button data-reorder=\"" + o._id + "\">Reorder</button>" +
          "</div>"
      )
      .join("");
    list.querySelectorAll("[data-reorder]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await api("/orders/" + btn.dataset.reorder + "/reorder", { method: "POST" });
          showMessage("Reordered successfully", true);
          loadMyOrders();
        } catch (err) {
          showMessage(err.message, false);
        }
      });
    });
  } catch (err) {
    showMessage(err.message, false);
  }
}

// ---------- Store staff ----------
document.getElementById("refreshStaffOrdersBtn").addEventListener("click", loadStaffOrders);
document.getElementById("refreshAlertsBtn").addEventListener("click", loadAlerts);

async function loadStaffOrders() {
  try {
    const storeId = state.user.storeId || (await api("/auth/me")).user.storeId;
    const orders = await api("/stores/" + storeId + "/orders");
    const list = document.getElementById("staffOrdersList");
    list.innerHTML = orders
      .map(
        (o) =>
          "<div class=\"order-card\">" +
          "<strong>#" + o._id.slice(-6) + "</strong> - <span class=\"status-pill status-" + o.status + "\">" + o.status + "</span><br/>" +
          o.items.map((i) => i.name + " x" + i.quantity).join(", ") +
          "<br/><button data-pick=\"" + o._id + "\">Pick</button>" +
          "<button data-pack=\"" + o._id + "\">Pack</button>" +
          "</div>"
      )
      .join("");
    list.querySelectorAll("[data-pick]").forEach((btn) =>
      btn.addEventListener("click", () => transitionOrder(btn.dataset.pick, "pick"))
    );
    list.querySelectorAll("[data-pack]").forEach((btn) =>
      btn.addEventListener("click", () => transitionOrder(btn.dataset.pack, "pack"))
    );
  } catch (err) {
    showMessage(err.message, false);
  }
}

async function transitionOrder(orderId, action) {
  try {
    await api("/orders/" + orderId + "/" + action, { method: "PUT" });
    showMessage("Order updated", true);
    loadStaffOrders();
  } catch (err) {
    showMessage(err.message, false);
  }
}

async function loadAlerts() {
  try {
    const storeId = state.user.storeId || (await api("/auth/me")).user.storeId;
    const alerts = await api("/stores/" + storeId + "/stock/alerts");
    const list = document.getElementById("alertsList");
    if (alerts.length === 0) {
      list.innerHTML = "<p class=\"hint\">No low-stock items.</p>";
      return;
    }
    list.innerHTML = alerts
      .map(
        (a) =>
          "<div class=\"stock-alert\">" +
          (a.productId ? a.productId.name : a.productId) +
          " - qty " + a.quantity + " (reorder at " + a.reorderPoint + ")" +
          "</div>"
      )
      .join("");
  } catch (err) {
    showMessage(err.message, false);
  }
}

// ---------- Delivery partner ----------
document.getElementById("availabilityToggle").addEventListener("change", async (e) => {
  try {
    await api("/delivery-partners/me/availability", {
      method: "PUT",
      body: JSON.stringify({ isAvailable: e.target.checked }),
    });
    showMessage("Availability updated", true);
  } catch (err) {
    showMessage(err.message, false);
  }
});

document.getElementById("loadPartnerOrderBtn").addEventListener("click", async () => {
  try {
    const id = document.getElementById("partnerOrderId").value.trim();
    const order = await api("/orders/" + id);
    document.getElementById("partnerOrderDetail").innerHTML =
      "<div class=\"order-card\">Status: <span class=\"status-pill status-" + order.status + "\">" + order.status + "</span><br/>" +
      order.items.map((i) => i.name + " x" + i.quantity).join(", ") +
      "<br/>Deliver to: " + order.deliveryAddress.line1 + "</div>";
  } catch (err) {
    showMessage(err.message, false);
  }
});

document.querySelectorAll(".status-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      const id = document.getElementById("partnerOrderId").value.trim();
      if (!id) throw new Error("Load an order first");
      await api("/orders/" + id + "/status", {
        method: "PUT",
        body: JSON.stringify({ status: btn.dataset.status }),
      });
      showMessage("Status updated to " + btn.dataset.status, true);
      document.getElementById("loadPartnerOrderBtn").click();
    } catch (err) {
      showMessage(err.message, false);
    }
  });
});

// ---------- Admin ----------
document.getElementById("refreshReportBtn").addEventListener("click", loadReport);

async function loadReport() {
  try {
    const rows = await api("/admin/reports/performance");
    const tbody = document.querySelector("#reportTable tbody");
    tbody.innerHTML = rows
      .map(
        (r) =>
          "<tr><td>" + (r.storeName || r.storeId) + "</td><td>" + r.orderVolume + "</td><td>" + r.deliveredCount +
          "</td><td>" + r.failedCount + "</td><td>" + (r.avgPickTimeMinutes != null ? r.avgPickTimeMinutes : "-") +
          "</td><td>" + (r.avgDeliveryTimeMinutes != null ? r.avgDeliveryTimeMinutes : "-") + "</td><td>Rs " + r.revenue + "</td></tr>"
      )
      .join("");
  } catch (err) {
    showMessage(err.message, false);
  }
}

document.getElementById("createStoreBtn").addEventListener("click", async () => {
  try {
    const body = {
      name: document.getElementById("newStoreName").value.trim(),
      area: document.getElementById("newStoreArea").value.trim(),
      serviceablePincodes: document
        .getElementById("newStorePincodes")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const store = await api("/stores", { method: "POST", body: JSON.stringify(body) });
    showMessage("Store created: " + store.name + " (id " + store._id + ")", true);
  } catch (err) {
    showMessage(err.message, false);
  }
});

document.getElementById("createProductBtn").addEventListener("click", async () => {
  try {
    const body = {
      name: document.getElementById("newProdName").value.trim(),
      category: document.getElementById("newProdCategory").value.trim(),
      price: parseFloat(document.getElementById("newProdPrice").value),
    };
    const product = await api("/products", { method: "POST", body: JSON.stringify(body) });
    showMessage("Product created: " + product.name, true);
  } catch (err) {
    showMessage(err.message, false);
  }
});
