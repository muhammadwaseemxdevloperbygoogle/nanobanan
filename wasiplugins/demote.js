module.exports = {
    name: 'demote',
    category: 'Group',
    desc: 'Demote admin to member',
    ownerOnly: false,
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;

        if (!wasi_sender.endsWith('@g.us')) {
            return wasi_sock.sendMessage(wasi_sender, { text: '❌ This command only works in groups!' });
        }

        try {
            const groupMeta = await wasi_sock.groupMetadata(wasi_sender);
            const botId = wasi_sock.user.id.replace(/:.*@/, '@');
            const senderId = wasi_msg.key.participant || wasi_sender;

            const botAdmin = groupMeta.participants.find(p => p.id.includes(botId.split('@')[0]))?.admin;
            if (!botAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ Bot must be admin to demote members!' });
            }

            const senderAdmin = groupMeta.participants.find(p => p.id === senderId)?.admin;
            if (!senderAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ You must be an admin to use this command!' });
            }

            let usersToDemote = [];
            const mentioned = wasi_msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = wasi_msg.message.extendedTextMessage?.contextInfo?.participant;

            if (mentioned.length > 0) {
                usersToDemote = mentioned;
            } else if (quoted) {
                usersToDemote = [quoted];
            } else if (wasi_args) {
                const number = wasi_args.replace(/[^0-9]/g, '');
                if (number) usersToDemote = [`${number}@s.whatsapp.net`];
            }

            if (usersToDemote.length === 0) {
                return wasi_sock.sendMessage(wasi_sender, {
                    text: '❌ *Mention or reply to user(s) to demote!*\n\nUsage: `.demote @user`'
                });
            }

            await wasi_sock.groupParticipantsUpdate(wasi_sender, usersToDemote, 'demote');
            await wasi_sock.sendMessage(wasi_sender, {
                text: `✅ Successfully demoted ${usersToDemote.length} admin(s) to member!`
            });

        } catch (error) {
            console.error('Demote error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to demote member(s).' });
        }
    }
};
