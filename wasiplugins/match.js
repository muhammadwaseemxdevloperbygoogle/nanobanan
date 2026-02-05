module.exports = {
    name: 'match',
    aliases: ['live', 'matches'],
    category: 'Sports',
    desc: 'List live cricket matches',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_cricket_live } = require('../wasilib/cricket');

        try {
            await sock.sendMessage(from, { text: '🔄 Fetching live matches...' }, { quoted: wasi_msg });

            const data = await wasi_cricket_live();

            if (!data.status || !data.matches || data.matches.length === 0) {
                return await sock.sendMessage(from, { text: "🏏 No live matches found currently." }, { quoted: wasi_msg });
            }

            let msg = `*🏏 LIVE CRICKET MATCHES*\n\n`;

            // Filter if args provided
            const query = wasi_args.join(' ').toLowerCase();
            const matches = query ? data.matches.filter(m => m.title.toLowerCase().includes(query)) : data.matches;

            if (matches.length === 0) {
                return await sock.sendMessage(from, { text: `🏏 No matches found for "${query}".` }, { quoted: wasi_msg });
            }

            matches.forEach(m => {
                msg += `🔸 *${m.title}*\n`;
                msg += `   🆔 *ID:* ${m.id}\n`;
                msg += `   📊 *Status:* ${m.status}\n\n`;
            });

            msg += `_Tip: Use .score <id> for details_`;

            await sock.sendMessage(from, { text: msg }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Match Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ Error fetching matches." }, { quoted: wasi_msg });
        }
    }
};
