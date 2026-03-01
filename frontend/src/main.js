import "./styles.css";

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

let cart = [];

const productsContainer = document.getElementById("products");
const cartPopup = document.getElementById("cart-popup");
const openCartBtn = document.getElementById("open-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

function renderProducts() {
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
  cartTotal.textContent = total;
}

openCartBtn.addEventListener("click", () => {
  cartPopup.classList.toggle("open");
});

// AUTH SYSTEM
const authBtn = document.getElementById("auth-btn");
const authModal = document.getElementById("auth-modal");
const submitAuth = document.getElementById("submit-auth");
const toggleAuth = document.getElementById("toggle-auth");
const authTitle = document.getElementById("auth-title");
const checkoutBtn = document.querySelector(".checkout-btn");

let isLoginMode = true;
let currentUser = JSON.parse(localStorage.getItem("user"));

function updateAuthUI() {
  if (currentUser) {
    authBtn.textContent = "Logout";
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = "1";
  } else {
    authBtn.textContent = "Login";
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.5";
  }
}

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
  toggleAuth.textContent = isLoginMode
    ? "Don't have an account? Sign up"
    : "Already have an account? Login";
});

submitAuth.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Fill all fields");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ email }));
  currentUser = { email };

  authModal.classList.remove("active");
  updateAuthUI();
});

authModal.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.classList.remove("active");
  }
});

updateAuthUI();

renderProducts();