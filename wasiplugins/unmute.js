module.exports = {
    name: 'unmute',
    aliases: ['unmutegroup'],
    category: 'Group',
    desc: 'Unmute group (everyone can send messages)',
    ownerOnly: false,
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_isGroup, wasi_isAdmin, wasi_botIsAdmin } = context;

        if (!wasi_isGroup) {
            return sock.sendMessage(from, { text: '❌ This command only works in groups!' }, { quoted: wasi_msg });
        }

        if (!wasi_botIsAdmin) {
            return sock.sendMessage(from, { text: '❌ Bot must be admin to unmute group!' }, { quoted: wasi_msg });
        }

        if (!wasi_isAdmin) {
            return sock.sendMessage(from, { text: '❌ You must be an admin to use this command!' }, { quoted: wasi_msg });
        }

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, {
                text: '🔊 *Group Unmuted!*\n\nEveryone can send messages now.'
            }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Unmute error:', error);
            await sock.sendMessage(from, { text: `❌ Failed to unmute group.\n\n*Error:* ${error.message}` }, { quoted: wasi_msg });
        }
    }
};
