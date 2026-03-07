import "./styles.css";

document.addEventListener("DOMContentLoaded", () => {

  const USERS_API = "http://localhost:8000";
  const ORDERS_API = "http://localhost:8083";

  // =====================
  // STATE
  // =====================

  let cart = [];
  let isLoginMode = true;
  let currentUser = JSON.parse(localStorage.getItem("user"));

  // =====================
  // PRODUCTS
  // =====================

  const products = [
    { id: 1, name: "iPhone 15 Pro", price: 1200, image: "https://picsum.photos/400/300?1" },
    { id: 2, name: "Samsung Galaxy S24", price: 1100, image: "https://picsum.photos/400/300?2" },
    { id: 3, name: "MacBook Air M3", price: 1500, image: "https://picsum.photos/400/300?3" },
    { id: 4, name: "Sony WH-1000XM5", price: 400, image: "https://picsum.photos/400/300?4" },
    { id: 5, name: "Apple Watch Ultra", price: 900, image: "https://picsum.photos/400/300?5" },
    { id: 6, name: "iPad Pro", price: 1000, image: "https://picsum.photos/400/300?6" },
    { id: 7, name: "DJI Mini Drone", price: 800, image: "https://picsum.photos/400/300?7" },
    { id: 8, name: "PlayStation 5", price: 600, image: "https://picsum.photos/400/300?8" },
    { id: 9, name: "Dell XPS 15", price: 1800, image: "https://picsum.photos/400/300?9" }
  ];

  // =====================
  // DOM ELEMENTS
  // =====================

  const productsContainer = document.getElementById("products");
  const cartPopup = document.getElementById("cart-popup");
  const openCartBtn = document.getElementById("open-cart");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  const authBtn = document.getElementById("auth-btn");
  const authModal = document.getElementById("auth-modal");
  const submitAuth = document.getElementById("submit-auth");
  const toggleAuth = document.getElementById("toggle-auth");
  const authTitle = document.getElementById("auth-title");
  const checkoutBtn = document.querySelector(".checkout-btn");
  const authError = document.getElementById("auth-error");

  const adminBtn = document.getElementById("admin-btn");
  const ordersBtn = document.getElementById("orders-btn");

  // =====================
  // RENDER PRODUCTS
  // =====================

  function renderProducts() {

    productsContainer.innerHTML = "";

    products.forEach(product => {

      const div = document.createElement("div");
      div.className = "product";

      div.innerHTML = `
        <img src="${product.image}" />
        <h3>${product.name}</h3>
        <p>€${product.price}</p>
        <button>Add to Cart</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        addToCart(product);
      });

      productsContainer.appendChild(div);

    });

  }

  // =====================
  // CART SYSTEM
  // =====================

  function addToCart(product) {
    cart.push(product);
    updateCart();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
  }

  function updateCart() {

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {

      total += item.price;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <span>${item.name} (€${item.price})</span>
        <button class="remove-btn">Remove</button>
      `;

      div.querySelector(".remove-btn").addEventListener("click", () => {
        removeFromCart(index);
      });

      cartItemsContainer.appendChild(div);

    });

    cartCount.textContent = cart.length;
    cartTotal.textContent = total.toFixed(2);

  }

  openCartBtn.addEventListener("click", () => {
    cartPopup.classList.toggle("open");
  });

  // =====================
  // AUTH UI UPDATE
  // =====================

  function updateAuthUI() {

    if (currentUser) {

      authBtn.textContent = "Logout";
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = "1";

      ordersBtn.classList.remove("hidden");

      if (currentUser.role === "admin") {
        adminBtn.classList.remove("hidden");
      }

    } else {

      authBtn.textContent = "Login";
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = "0.5";

      adminBtn.classList.add("hidden");
      ordersBtn.classList.add("hidden");

    }

  }

  // =====================
  // LOGIN / LOGOUT
  // =====================

  authBtn.addEventListener("click", () => {

    if (currentUser) {

      localStorage.removeItem("user");
      currentUser = null;
      updateAuthUI();

    } else {

      authModal.classList.add("active");

    }

  });

  toggleAuth.addEventListener("click", () => {

    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
    authError.textContent = "";

  });

  submitAuth.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    authError.textContent = "";

    if (!email || !password) {
      authError.textContent = "Please fill all fields.";
      return;
    }

    const endpoint = isLoginMode ? "/login" : "/register";

    try {

      const response = await fetch(USERS_API + endpoint, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: "User" })

      });

      const data = await response.json();

      if (!response.ok) {
        authError.textContent = data.detail || "Authentication failed.";
        return;
      }

      if (isLoginMode) {

        currentUser = data.user;
        localStorage.setItem("user", JSON.stringify(currentUser));
        authModal.classList.remove("active");
        updateAuthUI();

      } else {

        authError.style.color = "green";
        authError.textContent = "Registration successful! Please login.";

        isLoginMode = true;
        authTitle.textContent = "Login";

        document.getElementById("password").value = "";

      }

    } catch {
      authError.textContent = "Server error.";
    }

  });

  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.remove("active");
    }
  });

  // =====================
  // CHECKOUT
  // =====================

  checkoutBtn.addEventListener("click", async () => {

    if (!currentUser) {
      showToast("Please login first");
      return;
    }

    if (cart.length === 0) {
      showToast("Cart is empty");
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    try {

      const response = await fetch(`${ORDERS_API}/orders`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          totalAmount: totalAmount
        })

      });

      if (!response.ok) {
        showToast("Order failed");
        return;
      }

      showToast("✅ Order placed successfully!");

      cart = [];
      updateCart();
      cartPopup.classList.remove("open");

    } catch {
      showToast("Server error");
    }

  });

  // =====================
  // USER ORDER HISTORY
  // =====================

  async function loadUserOrders() {

    productsContainer.innerHTML = "<h2>My Orders</h2>";

    const response = await fetch(`${ORDERS_API}/orders`);
    const orders = await response.json();

    const userOrders = orders.filter(o => o.userId === currentUser.id);

    userOrders.forEach(order => {

      const div = document.createElement("div");
      div.className = "order-card";

      div.innerHTML = `
        <div class="order-header">
          <span>Order #${order.id}</span>
          <span>User ${order.userId}</span>
        </div>

        <div class="order-body">
          <span>Total: €${order.totalAmount}</span>
          <span>Status: ${order.status.name}</span>
        </div>
      `;

      productsContainer.appendChild(div);

    });

  }

  ordersBtn.addEventListener("click", () => {
    loadUserOrders();
  });

  // =====================
  // ADMIN PANEL
  // =====================

  adminBtn.addEventListener("click", () => {
    loadAdminOrders();
  });

  async function loadAdminOrders() {

  productsContainer.innerHTML = "<h2>Admin Panel - Orders</h2>";

  const response = await fetch(`${ORDERS_API}/orders`);
  const orders = await response.json();

  orders.forEach(order => {

    const div = document.createElement("div");
    div.className = "order-card";

    div.innerHTML = `
      <div class="order-header">
        <span>Order #${order.id}</span>
        <span>User ${order.userId}</span>
      </div>

      <div class="order-body">
        <span>Total: €${order.totalAmount}</span>

        <select data-order="${order.id}">
          <option value="1" ${order.status.id==1?'selected':''}>Pending</option>
          <option value="2" ${order.status.id==2?'selected':''}>Confirmed</option>
          <option value="5" ${order.status.id==5?'selected':''}>Delivered</option>
          <option value="6" ${order.status.id==6?'selected':''}>Canceled</option>
        </select>
      </div>
    `;

    const select = div.querySelector("select");

    select.addEventListener("change", async () => {

      await fetch(`${ORDERS_API}/orders/${order.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          statusId: parseInt(select.value)
        })
      });

      showToast("Order status updated");

    });

    productsContainer.appendChild(div);

  });

}

  // =====================
  // TOAST
  // =====================

  function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.remove("hidden");

    setTimeout(() => {
      toast.classList.add("hidden");
    }, 6000);

  }

  // =====================
  // INIT
  // =====================

  updateAuthUI();
  renderProducts();

});