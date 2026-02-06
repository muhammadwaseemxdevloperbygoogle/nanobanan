module.exports = {
    name: 'score',
    aliases: ['runs', 'details'],
    category: 'Sports',
    desc: 'Get live score and match details',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_cricket_details } = require('../wasilib/cricket');

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, { text: "❌ Please provide a Match ID.\nExample: *.score 123456*" }, { quoted: wasi_msg });
        }

        const matchId = wasi_args[0];

        try {
            // await sock.sendMessage(from, { text: '🔄 Fetching match details...' }, { quoted: wasi_msg });

            const data = await wasi_cricket_details(matchId);

            if (!data.status) {
                return await sock.sendMessage(from, { text: "❌ Failed to fetch details. Invalid ID or API error." }, { quoted: wasi_msg });
            }

            let msg = `*🏏 MATCH DETAILS*\n`;
            msg += `🆔 *ID:* ${matchId}\n`;

            if (data.players && data.players.teamBat) {
                msg += `⚔️ *Match:* ${data.players.teamBat} vs ${data.players.teamBowl}\n`;
            }

            msg += `📊 *Status:* ${data.liveStatus}\n`;
            msg += `🔢 *Score:* ${data.liveScore}\n`;
            msg += `──────────────────\n`;

            if (data.players) {
                if (data.players.batting && data.players.batting.length > 0) {
                    msg += `*🏏 ${data.players.teamBat || 'BATTING'}:*\n`;
                    data.players.batting.forEach(p => {
                        let text = `• *${p.name}*: ${p.runs}(${p.balls})`;
                        if (p.fours && p.sixes) text += ` ${p.fours}x4 ${p.sixes}x6`;
                        if (p.striker) text += ` ⭐`;
                        if (p.dismissal) text += `\n  _${p.dismissal}_`;
                        msg += text + `\n`;
                    });
                    msg += `\n`;
                }

                if (data.players.bowling && data.players.bowling.length > 0) {
                    msg += `*🥎 BOWLING:*\n`;
                    data.players.bowling.forEach(p => {
                        msg += `• *${p.name}*: ${p.wickets}-${p.runs} (${p.overs})\n`;
                    });
                    msg += `\n`;
                }
            }

            if (data.commentary && data.commentary.length > 0) {
                msg += `*🎙️ COMMENTARY:*\n`;
                data.commentary.slice(0, 2).forEach(c => {
                    msg += `> ${c}\n\n`;
                });
            }

            await sock.sendMessage(from, { text: msg }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Score Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ Error fetching scores." }, { quoted: wasi_msg });
        }
    }
};
