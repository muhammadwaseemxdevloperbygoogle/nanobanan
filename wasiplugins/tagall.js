module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'everyone'],
    category: 'Group',
    desc: 'Tag all members in the group',
    ownerOnly: false,
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;

        if (!wasi_sender.endsWith('@g.us')) {
            return wasi_sock.sendMessage(wasi_sender, { text: '❌ This command only works in groups!' });
        }

        try {
            const groupMeta = await wasi_sock.groupMetadata(wasi_sender);
            const senderId = wasi_msg.key.participant || wasi_sender;

            // Check if sender is admin
            const senderAdmin = groupMeta.participants.find(p => p.id === senderId)?.admin;
            if (!senderAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ Only admins can use tagall!' });
            }

            const participants = groupMeta.participants.map(p => p.id);
            const message = wasi_args || '📢 *Attention Everyone!*';

            // Build mention text
            let mentionText = `${message}\n\n`;
            participants.forEach((p, i) => {
                mentionText += `@${p.split('@')[0]}${(i + 1) % 5 === 0 ? '\n' : ' '}`;
            });

            await wasi_sock.sendMessage(wasi_sender, {
                text: mentionText,
                mentions: participants
            });

        } catch (error) {
            console.error('Tagall error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to tag all members.' });
        }
    }
};
