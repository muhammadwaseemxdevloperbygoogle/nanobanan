module.exports = {
    name: 'unmute',
    aliases: ['unmutegroup'],
    category: 'Group',
    desc: 'Unmute group (everyone can send messages)',
    ownerOnly: false,
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg } = context;

        if (!wasi_sender.endsWith('@g.us')) {
            return wasi_sock.sendMessage(wasi_sender, { text: '❌ This command only works in groups!' });
        }

        try {
            const groupMeta = await wasi_sock.groupMetadata(wasi_sender);
            const botId = wasi_sock.user.id.replace(/:.*@/, '@');
            const senderId = wasi_msg.key.participant || wasi_sender;

            const botAdmin = groupMeta.participants.find(p => p.id.includes(botId.split('@')[0]))?.admin;
            if (!botAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ Bot must be admin to unmute group!' });
            }

            const senderAdmin = groupMeta.participants.find(p => p.id === senderId)?.admin;
            if (!senderAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ You must be an admin to use this command!' });
            }

            await wasi_sock.groupSettingUpdate(wasi_sender, 'not_announcement');
            await wasi_sock.sendMessage(wasi_sender, {
                text: '🔊 *Group Unmuted!*\n\nEveryone can send messages now.'
            });

        } catch (error) {
            console.error('Unmute error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to unmute group.' });
        }
    }
};
