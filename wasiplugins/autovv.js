const { wasi_setUserAutoStatus, wasi_getUserAutoStatus } = require('../wasilib/database');

module.exports = {
    name: 'autovv',
    category: 'Settings',
    desc: 'Toggle Auto View Once Conversion on/off',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args, sessionId, config } = context;

        try {
            if (!wasi_args || wasi_args.length === 0) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Usage: .autovv on/off' });
            }

            const input = wasi_args[0].toLowerCase();
            const status = input === 'on';

            if (input !== 'on' && input !== 'off') {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Usage: .autovv on/off' });
            }

            // Target the OWNER defined in config, not necessarily the sender
            // This ensures index.js (which looks for owner settings) finds this update.
            const ownerNum = (config.ownerNumber || '').replace(/\D/g, '');
            if (!ownerNum) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Owner number not configured in bot settings.' });
            }
            const targetJid = ownerNum + '@s.whatsapp.net';

            const { wasi_getUserAutoStatus, wasi_setUserAutoStatus } = require('../wasilib/database');
            let settings = await wasi_getUserAutoStatus(sessionId, targetJid) || {};

            // Update
            settings.jid = targetJid;
            settings.autoViewOnce = status;

            // Save
            await wasi_setUserAutoStatus(sessionId, targetJid, settings);

            await wasi_sock.sendMessage(wasi_sender, { text: `✅ Auto View Once has been turned *${status ? 'ON' : 'OFF'}* for the Owner.\n\n(Target: ${ownerNum})` });

        } catch (e) {
            console.error('AutoVV Error:', e);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
