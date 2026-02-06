const { wasiApi } = require('./wasiapi');

/**
 * Search books on KitabNagri
 * @param {string} query
 */
async function wasi_kitabnagri_search(query) {
    try {
        const data = await wasiApi('/api/kitabnagri/search', { q: query });
        return data;
    } catch (e) {
        console.error('KitabNagri Search Failed:', e.message);
        return { status: false, message: 'Failed to search books' };
    }
}

/**
 * Get book details
 * @param {string} url
 */
async function wasi_kitabnagri_details(url) {
    try {
        const data = await wasiApi('/api/kitabnagri/details', { url });
        return data;
    } catch (e) {
        console.error('KitabNagri Details Failed:', e.message);
        return { status: false, message: 'Failed to fetch book details' };
    }
}

/**
 * Download from MediaFire
 * @param {string} url 
 */
async function wasi_mediafire_dl(url) {
    try {
        const data = await wasiApi('/api/download/mediafire', { url });
        return data;
    } catch (e) {
        console.error('MediaFire DL Failed:', e.message);
        return { status: false, message: 'Failed to download from MediaFire' };
    }
}

module.exports = {
    wasi_kitabnagri_search,
    wasi_kitabnagri_details,
    wasi_mediafire_dl
};
