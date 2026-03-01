import { fetchData } from '../api/api.js'

/**
 * Fetch and render users from the API
 * @param {string} apiUrl - The base URL for the users API
 */
export async function renderUsers(apiUrl) {
  const container = document.getElementById('users-container')
  
  try {
    const users = await fetchData(`${apiUrl}/users`)
    
    if (users.length === 0) {
      container.innerHTML = '<p class="empty">No users found</p>'
      return
    }
    
    container.innerHTML = `
      <div class="card-grid">
        ${users.map(user => `
          <div class="card">
            <h3>${escapeHtml(user.name || 'Unnamed User')}</h3>
            <p class="email">${escapeHtml(user.email)}</p>
            <p class="role">Role: ${escapeHtml(user.role)}</p>
          </div>
        `).join('')}
      </div>
    `
    container.classList.remove('loading')
  } catch (error) {
    container.innerHTML = `<p class="error">Error loading users: ${escapeHtml(error.message)}</p>`
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
