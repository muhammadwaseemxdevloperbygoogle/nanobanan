module.exports = {
    name: 'promote',
    category: 'Group',
    desc: 'Promote member to admin',
    ownerOnly: false,
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;

        // Check if in group
        if (!wasi_sender.endsWith('@g.us')) {
            return wasi_sock.sendMessage(wasi_sender, { text: '❌ This command only works in groups!' });
        }

        try {
            // Get group metadata
            const groupMeta = await wasi_sock.groupMetadata(wasi_sender);
            const botId = wasi_sock.user.id.replace(/:.*@/, '@');
            const senderId = wasi_msg.key.participant || wasi_sender;

            // Check if bot is admin
            const botAdmin = groupMeta.participants.find(p => p.id.includes(botId.split('@')[0]))?.admin;
            if (!botAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ Bot must be admin to promote members!' });
            }

            // Check if sender is admin
            const senderAdmin = groupMeta.participants.find(p => p.id === senderId)?.admin;
            if (!senderAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ You must be an admin to use this command!' });
            }

            // Get mentioned users or quoted user
            let usersToPromote = [];
            const mentioned = wasi_msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = wasi_msg.message.extendedTextMessage?.contextInfo?.participant;

            if (mentioned.length > 0) {
                usersToPromote = mentioned;
            } else if (quoted) {
                usersToPromote = [quoted];
            } else if (wasi_args) {
                // Parse phone number from args
                const number = wasi_args.replace(/[^0-9]/g, '');
                if (number) usersToPromote = [`${number}@s.whatsapp.net`];
            }

            if (usersToPromote.length === 0) {
                return wasi_sock.sendMessage(wasi_sender, {
                    text: '❌ *Mention or reply to user(s) to promote!*\n\nUsage: `.promote @user` or reply with `.promote`'
                });
            }

            await wasi_sock.groupParticipantsUpdate(wasi_sender, usersToPromote, 'promote');
            await wasi_sock.sendMessage(wasi_sender, {
                text: `✅ Successfully promoted ${usersToPromote.length} member(s) to admin!`
            });

        } catch (error) {
            console.error('Promote error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to promote member(s).' });
        }
    }
};
