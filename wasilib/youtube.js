const { wasiApi } = require('./wasiapi');

/**
 * YouTube Search via WASI DEV APIs
 * @param {string} query
 */
async function wasi_yt_search(query) {
    try {
        const data = await wasiApi('/api/search/youtube', { q: query });
        return data;
    } catch (e) {
        console.error('YT Search Failed:', e.message);
        return { status: false, message: 'Failed to search YouTube' };
    }
}

/**
 * YouTube Video Download via WASI DEV APIs
 * Uses multi-provider fallback (SriHub > AIO > Vreden > SaveTube > Y2mate)
 * @param {string} url
 */
async function wasi_yt_video(url) {
    try {
        const data = await wasiApi('/api/download/youtube/video', { url });

        // Normalize response for consistent plugin usage
        if (data.status && data.result) {
            return {
                status: true,
                title: data.title || 'YouTube Video',
                thumbnail: data.thumbnail || '',
                duration: data.duration || '',
                channel: data.channel || data.method || 'YouTube',
                quality: data.quality || '720p',
                result: data.result
            };
        }

        return { status: false, message: data.message || 'Failed to fetch video link' };
    } catch (e) {
        console.error('YT Video Failed:', e.message);
        return { status: false, message: 'Failed to fetch video link' };
    }
}

/**
 * YouTube Audio Download via WASI DEV APIs
 * Uses multi-provider fallback (SriHub > AIO > Vreden > SaveTube > Y2mate)
 * @param {string} url
 */
async function wasi_yt_audio(url) {
    try {
        const data = await wasiApi('/api/download/youtube/audio', { url });

        // Normalize response for consistent plugin usage
        if (data.status && data.result) {
            return {
                status: true,
                title: data.title || 'YouTube Audio',
                thumbnail: data.thumbnail || '',
                duration: data.duration || '',
                channel: data.channel || data.method || 'YouTube',
                quality: data.quality || '128kbps',
                result: data.result
            };
        }

        return { status: false, message: data.message || 'Failed to fetch audio link' };
    } catch (e) {
        console.error('YT Audio Failed:', e.message);
        return { status: false, message: 'Failed to fetch audio link' };
    }
}

module.exports = {
    wasi_yt_search,
    wasi_yt_video,
    wasi_yt_audio
};
