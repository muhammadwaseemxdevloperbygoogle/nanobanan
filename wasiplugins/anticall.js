module.exports = {
    name: 'anticall',
    category: 'Security',
    desc: 'Toggle automatic call rejection.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args, sessionId, config } = context;
        const { wasi_updateBotConfig } = require('../wasilib/database');

        if (!context.wasi_isOwner) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ This command is restricted to the Owner.' }, { quoted: wasi_msg });
        }

        const action = wasi_args[0] ? wasi_args[0].toLowerCase() : null;

        if (action === 'on') {
            await wasi_updateBotConfig(sessionId, { autoRejectCall: true });
            if (context.config) context.config.autoRejectCall = true; // Hot-reload for current session
            return await wasi_sock.sendMessage(wasi_sender, { text: '✅ *Anti-Call Enabled!* The bot will now automatically reject incoming calls.' }, { quoted: wasi_msg });
        } else if (action === 'off') {
            await wasi_updateBotConfig(sessionId, { autoRejectCall: false });
            if (context.config) context.config.autoRejectCall = false; // Hot-reload for current session
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ *Anti-Call Disabled!*' }, { quoted: wasi_msg });
        } else {
            const status = config.autoRejectCall ? 'ENABLED' : 'DISABLED';
            return await wasi_sock.sendMessage(wasi_sender, { text: `🛡️ *Anti-Call Status:* ${status}\n\nUsage:\n- .anticall on\n- .anticall off` }, { quoted: wasi_msg });
        }
    }
};
