module.exports = {
    name: 'schedule',
    aliases: ['matchlist', 'upcoming'],
    category: 'Sports',
    desc: 'Get upcoming cricket schedule',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg } = context;
        const axios = require('axios');
        const API_URL = 'http://localhost:3000/api/cricket/schedule';

        try {
            await sock.sendMessage(from, { text: '🔄 Fetching schedule...' }, { quoted: wasi_msg });

            const { data } = await axios.get(API_URL);

            if (!data.status || !data.schedule || data.schedule.length === 0) {
                return await sock.sendMessage(from, { text: "📅 No upcoming matches found." }, { quoted: wasi_msg });
            }

            let msg = `*📅 UPCOMING MATCHES*\n\n`;

            // Limit to next 5 days
            const days = data.schedule.slice(0, 5);

            days.forEach(day => {
                msg += `*🗓️ ${day.date}*\n`;
                day.matches.forEach(m => {
                    // Clean up title
                    let title = m.title.replace('Global T20 Canada 2025', '').trim(); // Example cleanup
                    msg += `🔸 ${title}\n`;
                    if (m.meta) msg += `   _${m.meta}_\n`;
                });
                msg += `\n`;
            });

            msg += `> _Powered by WASI-API_`;

            await sock.sendMessage(from, { text: msg }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Schedule Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ Error fetching schedule. Make sure the API is running." }, { quoted: wasi_msg });
        }
    }
};
