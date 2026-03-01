/**
 * Generic fetch function for API calls
 * @param {string} url - The URL to fetch from
 * @returns {Promise<any>} - The JSON response data
 */
export async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}
