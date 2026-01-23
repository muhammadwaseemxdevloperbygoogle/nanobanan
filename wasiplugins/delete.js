const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'delete',
    aliases: ['del', 'unsend'],
    category: 'Group',
    desc: 'Delete a message (reply to the message you want to delete)',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_isAdmin, wasi_isOwner, wasi_isSudo, wasi_botIsAdmin } = context;

        // Check if there is a quoted message
        const contextInfo = wasi_msg.message?.extendedTextMessage?.contextInfo;
        const quotedKey = contextInfo?.stanzaId;
        const quotedParticipant = contextInfo?.participant;

        if (!quotedKey) {
            return await sock.sendMessage(from, { text: '❌ Please reply to the message you want to delete.' });
        }

        const me = jidNormalizedUser(sock.user?.id || sock.authState?.creds?.me?.id);
        const isFromMe = jidNormalizedUser(quotedParticipant) === me;

        // Key of the message to delete
        const key = {
            remoteJid: from,
            fromMe: isFromMe,
            id: quotedKey,
            participant: quotedParticipant
        };

        // If it's not the bot's own message
        if (!isFromMe) {
            // If deleting someone else's message, sender must be Admin/Owner/Sudo
            if (!wasi_isAdmin && !wasi_isOwner && !wasi_isSudo) {
                return await sock.sendMessage(from, { text: '❌ You need to be an Admin to delete someone else\'s message.' });
            }
            // And Bot must be Admin in the group
            if (!wasi_botIsAdmin) {
                return await sock.sendMessage(from, { text: '❌ I need to be an Admin to delete other people\'s messages.' });
            }
        }

        try {
            await sock.sendMessage(from, { delete: key });
        } catch (err) {
            console.error('Delete Message Error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to delete message. It might be too old or I lack permission.' });
        }
    }
};
