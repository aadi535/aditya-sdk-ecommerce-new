import { fetchData } from '../api/api.js'

/**
 * Fetch and render orders from the API
 * @param {string} apiUrl - The base URL for the orders API
 */
export async function renderOrders(apiUrl) {
  const container = document.getElementById('orders-container')
  
  try {
    const orders = await fetchData(`${apiUrl}/orders`)
    
    if (orders.length === 0) {
      container.innerHTML = '<p class="empty">No orders found</p>'
      return
    }
    
    container.innerHTML = `
      <div class="card-grid">
        ${orders.map(order => `
          <div class="card">
            <h3>Order #${order.id}</h3>
            <p>User ID: ${order.userId}</p>
            <p class="price">Total: $${order.totalAmount}</p>
            <p class="status">Status: ${escapeHtml(order.status?.name || 'Unknown')}</p>
            <p class="date">Created: ${formatDate(order.createdAt)}</p>
          </div>
        `).join('')}
      </div>
    `
    container.classList.remove('loading')
  } catch (error) {
    container.innerHTML = `<p class="error">Error loading orders: ${escapeHtml(error.message)}</p>`
    container.classList.remove('loading')
  }
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return 'Invalid date'
  }
}
