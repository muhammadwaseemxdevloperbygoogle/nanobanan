const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'demote',
    category: 'Group',
    desc: 'Demote admin to member',
    wasi_handler: async (wasi_sock, wasi_chatId, context) => {
        const { wasi_msg, wasi_args, wasi_isGroup, wasi_isAdmin, wasi_botIsAdmin, wasi_isOwner, wasi_isSudo } = context;

        if (!wasi_isGroup) return wasi_sock.sendMessage(wasi_chatId, { text: '❌ This command only works in groups.' }, { quoted: wasi_msg });

        if (!wasi_isAdmin && !wasi_isSudo) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ Only Group Admins can use this command.' }, { quoted: wasi_msg });
        }

        if (!wasi_botIsAdmin) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ I need to be an Admin to demote members.' }, { quoted: wasi_msg });
        }

        let usersToDemote = [];
        const quoted = wasi_msg.message?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = wasi_msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (quoted) {
            usersToDemote.push(jidNormalizedUser(quoted));
        } else if (mentioned.length > 0) {
            usersToDemote = mentioned.map(j => jidNormalizedUser(j));
        } else if (wasi_args.length > 0) {
            const rawNumber = wasi_args[0].replace(/\D/g, '');
            if (rawNumber.length >= 7) {
                usersToDemote.push(jidNormalizedUser(rawNumber + '@s.whatsapp.net'));
            }
        }

        if (usersToDemote.length === 0) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❓ Usage: Tag user(s), reply to a message, or provide a number.\nExample: *.demote @user*' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.groupParticipantsUpdate(wasi_chatId, usersToDemote, 'demote');
            await wasi_sock.sendMessage(wasi_chatId, { text: `✅ Successfully demoted ${usersToDemote.length} admin(s).` }, { quoted: wasi_msg });
        } catch (e) {
            console.error('Demote Command Error:', e);
            await wasi_sock.sendMessage(wasi_chatId, { text: `❌ Failed to demote user(s).` }, { quoted: wasi_msg });
        }
    }
};
