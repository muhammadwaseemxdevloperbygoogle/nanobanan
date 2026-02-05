const { wasiApi } = require('./wasiapi');

/**
 * Cricket Live Matches
 * @returns {Promise<Object>}
 */
async function wasi_cricket_live() {
    try {
        const data = await wasiApi('/api/cricket/live');
        if (data && data.status && data.matches) {
            return { status: true, matches: data.matches };
        }
    } catch (e) {
        console.error('Cricket Live Failed:', e.message);
    }
    return { status: false, message: 'Failed to fetch live matches' };
}

/**
 * Cricket Match Details
 * @param {string} matchId
 * @returns {Promise<Object>}
 */
async function wasi_cricket_details(matchId) {
    try {
        const data = await wasiApi('/api/cricket/details', { id: matchId });
        if (data && data.status) {
            return {
                status: true,
                liveStatus: data.liveStatus,
                liveScore: data.liveScore,
                players: data.players,
                commentary: data.commentary
            };
        }
    } catch (e) {
        console.error('Cricket Details Failed:', e.message);
    }
    return { status: false, message: 'Failed to fetch match details' };
}

/**
 * Cricket Schedule
 * @returns {Promise<Object>}
 */
async function wasi_cricket_schedule() {
    try {
        const data = await wasiApi('/api/cricket/schedule');
        if (data && data.status && data.schedule) {
            return { status: true, schedule: data.schedule };
        }
    } catch (e) {
        console.error('Cricket Schedule Failed:', e.message);
    }
    return { status: false, message: 'Failed to fetch schedule' };
}

module.exports = {
    wasi_cricket_live,
    wasi_cricket_details,
    wasi_cricket_schedule
};
