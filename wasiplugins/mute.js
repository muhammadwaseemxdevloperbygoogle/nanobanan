module.exports = {
    name: 'mute',
    aliases: ['mutegroup'],
    category: 'Group',
    desc: 'Mute group (only admins can send messages)',
    ownerOnly: false,
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_isGroup, wasi_isAdmin, wasi_botIsAdmin } = context;

        if (!wasi_isGroup) {
            return sock.sendMessage(from, { text: '❌ This command only works in groups!' }, { quoted: wasi_msg });
        }

        if (!wasi_botIsAdmin) {
            return sock.sendMessage(from, { text: '❌ Bot must be admin to mute group!' }, { quoted: wasi_msg });
        }

        if (!wasi_isAdmin) {
            return sock.sendMessage(from, { text: '❌ You must be an admin to use this command!' }, { quoted: wasi_msg });
        }

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, {
                text: '🔇 *Group Muted!*\n\nOnly admins can send messages now.'
            }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Mute error:', error);
            await sock.sendMessage(from, { text: `❌ Failed to mute group.\n\n*Error:* ${error.message}` }, { quoted: wasi_msg });
        }
    }
};
