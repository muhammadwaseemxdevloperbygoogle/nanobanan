const axios = require('axios');

// WASI DEV APIs Configuration
const WASIDEV_API_BASE = 'https://wasidev-apis-bcceee4d52a4.herokuapp.com';

/**
 * Call WASI DEV APIs with automatic fallback
 * @param {string} endpoint - API endpoint (e.g., '/api/stalk/github')
 * @param {object} params - Query parameters
 * @param {function} fallbackFn - Fallback function if WASI API fails
 */
async function wasiApi(endpoint, params = {}, fallbackFn = null) {
    try {
        const url = new URL(endpoint, WASIDEV_API_BASE);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await axios.get(url.toString(), { timeout: 15000 });

        if (response.data && response.data.status) {
            return response.data;
        }

        // If WASI API returns status: false, try fallback
        if (fallbackFn) {
            console.log(`[WASI-API] Primary failed, using fallback for ${endpoint}`);
            return await fallbackFn();
        }

        return response.data;
    } catch (error) {
        console.log(`[WASI-API] Error on ${endpoint}: ${error.message}`);

        // Try fallback on any error
        if (fallbackFn) {
            console.log(`[WASI-API] Using fallback for ${endpoint}`);
            return await fallbackFn();
        }

        return { status: false, message: error.message };
    }
}

/**
 * POST request to WASI DEV APIs
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data for file uploads
 */
async function wasiApiPost(endpoint, formData) {
    try {
        const url = WASIDEV_API_BASE + endpoint;
        const response = await axios.post(url, formData, {
            headers: formData.getHeaders ? formData.getHeaders() : {},
            timeout: 30000
        });
        return response.data;
    } catch (error) {
        return { status: false, message: error.message };
    }
}

module.exports = { wasiApi, wasiApiPost, WASIDEV_API_BASE };
