const { wasi_updateBotConfig } = require('../wasilib/database');

module.exports = {
    name: 'levelup-toggle',
    aliases: ['levelup', 'rank-toggle', 'ranksw'],
    category: 'Settings',
    description: 'Toggle the Level Up / Rank system ON or OFF',
    ownerOnly: true,
    wasi_handler: async (sock, from, context) => {
        const { wasi_args, sessionId, wasi_msg, config } = context;

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, {
                text: `*🆙 Level Up System*\n\nStatus: *${config.levelup !== false ? 'Enabled ✅' : 'Disabled ❌'}*\n\nUsage: .levelup on/off`
            }, { quoted: wasi_msg });
        }

        const state = wasi_args[0].toLowerCase();
        let rankState;

        if (state === 'on' || state === 'enable' || state === '1') {
            rankState = true;
        } else if (state === 'off' || state === 'disable' || state === '0') {
            rankState = false;
        } else {
            return await sock.sendMessage(from, { text: '❌ Invalid state. Use *on* or *off*.' }, { quoted: wasi_msg });
        }

        const success = await wasi_updateBotConfig(sessionId, { levelup: rankState });

        if (success) {
            // Update live config
            if (config) config.levelup = rankState;

            await sock.sendMessage(from, {
                text: `✅ Level Up / Rank system has been turned *${rankState ? 'ON' : 'OFF'}*.`
            }, { quoted: wasi_msg });
        } else {
            await sock.sendMessage(from, { text: '❌ Database Error: Failed to update settings.' }, { quoted: wasi_msg });
        }
    }
};
