module.exports = {
    name: 'antibot',
    aliases: ['antibotsystem'],
    category: 'Group',
    desc: 'Enable/Disable Anti-Bot protection in the group. (Admins Only)',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args, wasi_isGroup, wasi_msg } = context;
        const { toggleAntiBot } = require('../wasilib/antibot');

        if (!wasi_isGroup) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Only in groups.' });
        }

        // Check Admin
        // We need to fetch group metadata to verify if sender is admin
        const metadata = await wasi_sock.groupMetadata(wasi_sender);
        const participant = metadata.participants.find(p => p.id === wasi_msg.key.participant || p.id === wasi_sender);
        if (!participant || !participant.admin) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Admins Only!' });
        }

        if (!wasi_args[0]) {
            return await wasi_sock.sendMessage(wasi_sender, { text: 'Usage: .antibot on / off' });
        }

        const mode = wasi_args[0].toLowerCase();

        if (mode === 'on') {
            toggleAntiBot(wasi_sender, true);
            return await wasi_sock.sendMessage(wasi_sender, { text: '🛡️ Anti-Bot System ENABLED.\n> I will warn (3 times) and kick any bot detected.' });
        } else if (mode === 'off') {
            toggleAntiBot(wasi_sender, false);
            return await wasi_sock.sendMessage(wasi_sender, { text: '🛡️ Anti-Bot System DISABLED.' });
        } else {
            return await wasi_sock.sendMessage(wasi_sender, { text: 'Usage: .antibot on / off' });
        }
    }
};
