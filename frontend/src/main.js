import { renderProducts } from './components/products.js'
import { renderUsers } from './components/users.js'
import { renderOrders } from './components/orders.js'

// API URLs from environment variables
const config = {
  productsApiUrl: import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:8082',
  usersApiUrl: import.meta.env.VITE_USERS_API_URL || 'http://localhost:8000',
  ordersApiUrl: import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8083'
}

/**
 * Initialize the application
 */
async function init() {
  const app = document.getElementById('app')
  
  // Render the main layout
  app.innerHTML = `
    <header class="header">
      <h1>E-commerce Starter</h1>
      <p>Frontend is running successfully!</p>
    </header>
    
    <main class="main">
      <section class="api-info">
        <h2>API Configuration</h2>
        <ul>
          <li><strong>Products API:</strong> ${config.productsApiUrl}</li>
          <li><strong>Users API:</strong> ${config.usersApiUrl}</li>
          <li><strong>Orders API:</strong> ${config.ordersApiUrl}</li>
        </ul>
      </section>
      
      <section id="products-section" class="data-section">
        <h2>Products</h2>
        <div id="products-container" class="loading">Loading products...</div>
      </section>
      
      <section id="users-section" class="data-section">
        <h2>Users</h2>
        <div id="users-container" class="loading">Loading users...</div>
      </section>
      
      <section id="orders-section" class="data-section">
        <h2>Orders</h2>
        <div id="orders-container" class="loading">Loading orders...</div>
      </section>
    </main>
  `
  
  // Fetch and render data from all APIs
  // Using Promise.allSettled to handle partial failures gracefully
  await Promise.allSettled([
    renderProducts(config.productsApiUrl),
    renderUsers(config.usersApiUrl),
    renderOrders(config.ordersApiUrl)
  ])
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init)
