import './styles.css';

const USERS_API = (import.meta.env.VITE_USERS_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const PRODUCTS_API = (import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:8082').replace(/\/$/, '');
const ORDERS_API = (import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8083').replace(/\/$/, '');
const $ = id => document.getElementById(id);
let products = [], cart = [], currentUser = null, token = sessionStorage.getItem('apex-token'), isLoginMode = true;

const money = value => new Intl.NumberFormat('en-IE', {style:'currency', currency:'EUR'}).format(Number(value));
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
let toastTimer;
function toast(message) {
  $('toast').textContent = message; $('toast').classList.remove('hidden');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 6000);
}
async function api(base, path, options = {}) {
  const response = await fetch(base + path, {...options, signal: AbortSignal.timeout(120000), headers: {
    'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...options.headers
  }});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/login') { token = null; currentUser = null; sessionStorage.removeItem('apex-token'); updateAuth(); }
    const message = typeof data.detail === 'string' ? data.detail : Array.isArray(data.detail) ? data.detail.map(e => e.msg).join('. ') : data.message || data.error;
    throw new Error(message || `Request failed (${response.status}). Please retry.`);
  }
  return data;
}
function updateAuth() {
  $('auth-btn').textContent = currentUser ? 'Log out' : 'Log in';
  $('orders-btn').classList.toggle('hidden', !currentUser);
  $('admin-btn').classList.toggle('hidden', currentUser?.role !== 'admin');
  $('account-status').textContent = currentUser ? `Signed in as ${currentUser.email}` : 'Browse freely. Log in to save an order.';
  document.querySelector('.checkout-btn').textContent = currentUser ? 'Place demo order' : 'Log in to order';
}
function updateCart() {
  $('cart-items').innerHTML = cart.length ? '' : '<p>Your bag is empty.</p>';
  cart.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'cart-item';
    row.innerHTML = `<span>${escape(item.name)} (${money(item.price)})</span><button class="remove-btn" aria-label="Remove ${escape(item.name)}">Remove</button>`;
    row.querySelector('button').onclick = () => { cart.splice(index, 1); updateCart(); };
    $('cart-items').append(row);
  });
  $('cart-count').textContent = cart.length;
  $('cart-total').textContent = cart.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2);
}
function showProduct(product) {
  $('product-modal-img').src = product.imageUrl || '/images/iphone.jpg';
  $('product-modal-img').alt = product.name;
  $('product-modal-title').textContent = product.name;
  $('product-modal-desc').textContent = product.description || 'Sample catalog product.';
  $('product-modal-price').textContent = Number(product.price).toFixed(2);
  $('product-modal').classList.add('active');
  $('close-product').focus();
}
function renderProducts() {

  const container = $('products'); container.innerHTML = '';
  if (!products.length) container.innerHTML = '<p>No products available.</p>';
  products.forEach(product => {
    const card = document.createElement('article'); card.className = 'product';
    card.innerHTML = `<button class="product-image" aria-label="View ${escape(product.name)}"><img src="${escape(product.imageUrl || '/images/iphone.jpg')}" alt="${escape(product.name)}" loading="lazy"></button><h3 class="centre">${escape(product.name)}</h3><p class="centre">${money(product.price)}</p><button class="add-product" ${product.stock <= 0 ? 'disabled' : ''}>${product.stock > 0 ? 'Add to bag' : 'Out of stock'}</button>`;
    card.querySelector('.product-image').onclick = () => showProduct(product);
    card.querySelector('.add-product').onclick = () => {
      if (cart.filter(item => item.id === product.id).length >= Math.min(product.stock, 20)) { toast('Maximum available quantity reached.'); return; }
      cart.push(product); updateCart(); toast(`${product.name} added to your bag.`);
    };
    container.append(card);
  });
}
async function loadProducts() {
  $('products').innerHTML = '<p class="service-message" role="status">Loading the catalog… Free hosted services may take a minute to wake up.</p>';
  try { products = await api(PRODUCTS_API, '/products'); renderProducts(); }
  catch (error) { $('products').innerHTML = `<div class="service-message"><p>${escape(error.message)}</p><button id="retry-catalog">Try again</button></div>`; $('retry-catalog').onclick = loadProducts; }
}
async function loadOrders(admin = false) {
  if (!currentUser) return;

  const container = $('products'); container.innerHTML = '<p class="service-message" role="status">Loading saved orders… Services may take a minute to wake up.</p>';
  try {
    const orders = await api(ORDERS_API, admin ? '/orders' : `/orders/user/${currentUser.id}`);
    container.innerHTML = `<h2 class="page-heading">${admin ? 'Admin · Customer orders' : 'My saved orders'}</h2>`;
    if (!orders.length) container.insertAdjacentHTML('beforeend', '<p>No orders yet. Browse the catalog to get started.</p>');
    orders.forEach(order => {
      const row = document.createElement('article'); row.className = 'order-card';
      row.innerHTML = `<div class="order-header"><strong>Order #${escape(order.id)}</strong><span>${new Date(order.createdAt).toLocaleDateString()}</span></div><div class="order-body"><span>${money(order.totalAmount)}</span><span>${escape(order.status?.name)}</span></div>`;
      if (admin) {
        const transitions = order.status?.name === 'Pending' ? [[2,'Confirmed'],[6,'Canceled']] : order.status?.name === 'Confirmed' ? [[5,'Delivered'],[6,'Canceled']] : [];
        if (transitions.length) {
          const select = document.createElement('select'); select.setAttribute('aria-label', `Update order ${order.id} status`);
          select.add(new Option('Change status…', ''));
          transitions.forEach(([id, label]) => select.add(new Option(label, id)));
          select.onchange = async () => {
            if (!select.value) return;
            select.disabled = true;
            try { await api(ORDERS_API, `/orders/${order.id}/status`, {method:'PUT',body:JSON.stringify({statusId:Number(select.value)})}); await loadOrders(true); toast('Order status saved.'); }
            catch (error) { toast(error.message); select.disabled = false; select.value = ''; }
          };
          row.append(select);
        }
      }
      container.append(row);
    });
  } catch (error) { container.innerHTML = `<div class="service-message"><p>${escape(error.message)}</p><button id="retry-orders">Try again</button></div>`; $('retry-orders').onclick = () => loadOrders(admin); }
}
$('home-btn').onclick = renderProducts;
$('open-cart').onclick = () => $('cart-popup').classList.toggle('open');
$('close-product').onclick = () => $('product-modal').classList.remove('active');
$('product-modal').onclick = e => { if (e.target === $('product-modal')) $('product-modal').classList.remove('active'); };
$('close-auth').onclick = () => $('auth-modal').classList.remove('active');
$('auth-modal').onclick = e => { if (e.target === $('auth-modal')) $('auth-modal').classList.remove('active'); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') { $('auth-modal').classList.remove('active'); $('product-modal').classList.remove('active'); $('cart-popup').classList.remove('open'); } });
$('auth-btn').onclick = async () => {
  if (!currentUser) { $('auth-error').textContent = ''; $('auth-modal').classList.add('active'); $('email').focus(); return; }
  try { await api(USERS_API, '/logout', {method:'POST'}); }
  catch (error) { toast(error.message); return; }
  token = null; currentUser = null; sessionStorage.removeItem('apex-token'); updateAuth(); renderProducts();
};
$('toggle-auth').onclick = () => {
  isLoginMode = !isLoginMode;
  $('auth-title').textContent = isLoginMode ? 'Log in' : 'Create account';
  $('toggle-auth').textContent = isLoginMode ? 'Create an account' : 'Already registered? Log in';
  $('password').autocomplete = isLoginMode ? 'current-password' : 'new-password';
  $('auth-error').textContent = '';
};
$('auth-form').onsubmit = async e => {
  e.preventDefault();
  const submit = $('submit-auth'); submit.disabled = true;
  $('auth-error').textContent = 'Connecting… Services may need a minute to wake up.';
  try {
    const data = await api(USERS_API, isLoginMode ? '/login' : '/register', {method:'POST', body:JSON.stringify({email:$('email').value.trim(), password:$('password').value, name:'Customer'})});
    if (isLoginMode) {
      token = data.token; currentUser = data.user; sessionStorage.setItem('apex-token', token);
      $('auth-modal').classList.remove('active'); updateAuth(); toast('You are logged in.');
    } else {
      isLoginMode = true; $('auth-title').textContent = 'Log in'; $('toggle-auth').textContent = 'Create an account';
      $('auth-error').textContent = 'Account created. You can now log in.';
    }
    $('password').value = '';
  } catch (error) { $('auth-error').textContent = error.message; }
  finally { submit.disabled = false; }
};
document.querySelector('.checkout-btn').onclick = async () => {
  if (!currentUser) { $('auth-modal').classList.add('active'); $('email').focus(); return; }
  if (!cart.length) { toast('Your bag is empty.'); return; }
  const button = document.querySelector('.checkout-btn'); button.disabled = true; button.textContent = 'Saving order…';
  const quantities = new Map(); cart.forEach(item => quantities.set(item.id, (quantities.get(item.id) || 0) + 1));
  try {
    const order = await api(ORDERS_API, '/orders', {method:'POST', body:JSON.stringify({items:[...quantities].map(([productId, quantity]) => ({productId,quantity}))})});
    cart = []; updateCart(); $('cart-popup').classList.remove('open');
    toast(`Demo order #${order.id} saved. No payment was taken.`); await loadOrders();
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; updateAuth(); }
};
$('orders-btn').onclick = () => loadOrders();
$('admin-btn').onclick = () => loadOrders(true);
updateAuth(); updateCart(); loadProducts();
if (token) api(USERS_API, '/me').then(user => { currentUser = user; updateAuth(); }).catch(() => { token = null; sessionStorage.removeItem('apex-token'); updateAuth(); });
// Wake authentication early; the website remains usable while it starts.
fetch(`${USERS_API}/health`).catch(() => {});
