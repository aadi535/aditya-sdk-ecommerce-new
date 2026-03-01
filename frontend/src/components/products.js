import { fetchData } from '../api/api.js'

/**
 * Fetch and render products from the API
 * @param {string} apiUrl - The base URL for the products API
 */
export async function renderProducts(apiUrl) {
  const container = document.getElementById('products-container')
  
  try {
    const products = await fetchData(`${apiUrl}/products`)
    
    if (products.length === 0) {
      container.innerHTML = '<p class="empty">No products found</p>'
      return
    }
    
    container.innerHTML = `
      <div class="card-grid">
        ${products.map(product => `
          <div class="card">
            <h3>${escapeHtml(product.name)}</h3>
            <p class="description">${escapeHtml(product.description || 'No description')}</p>
            <p class="price">$${product.price}</p>
            <p class="stock">Stock: ${product.stock}</p>
          </div>
        `).join('')}
      </div>
    `
    container.classList.remove('loading')
  } catch (error) {
    container.innerHTML = `<p class="error">Error loading products: ${escapeHtml(error.message)}</p>`
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
