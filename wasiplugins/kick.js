const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'kick',
    category: 'Group',
    desc: 'Remove a user from the group',
    wasi_handler: async (wasi_sock, wasi_chatId, context) => {
        const { wasi_msg, wasi_args, wasi_isGroup, wasi_isAdmin, wasi_botIsAdmin, wasi_isOwner, wasi_isSudo, config } = context;

        if (!wasi_isGroup) return wasi_sock.sendMessage(wasi_chatId, { text: '❌ This command only works in groups.' }, { quoted: wasi_msg });

        // 1. Permission Check: Sender must be Admin or Owner/Sudo
        if (!wasi_isAdmin && !wasi_isSudo) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ Only Group Admins can use this command.' }, { quoted: wasi_msg });
        }

        // 2. Permission Check: Bot must be Admin
        if (!wasi_botIsAdmin) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ I need to be an Admin to kick members.' }, { quoted: wasi_msg });
        }

        // 3. Robust JID Detection
        let targetJid = null;

        // Priority 1: Reply to a message
        const quoted = wasi_msg.message?.extendedTextMessage?.contextInfo?.participant;
        if (quoted) {
            targetJid = jidNormalizedUser(quoted);
        }
        // Priority 2: Mentioned users
        else if (wasi_msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = jidNormalizedUser(wasi_msg.message.extendedTextMessage.contextInfo.mentionedJid[0]);
        }
        // Priority 3: Raw number in args
        else if (wasi_args.length > 0) {
            const rawNumber = wasi_args[0].replace(/\D/g, '');
            if (rawNumber.length >= 7) {
                targetJid = jidNormalizedUser(rawNumber + '@s.whatsapp.net');
            }
        }

        if (!targetJid) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❓ Usage: Tag a user, reply to their message, or provide their number.\nExample: *.kick @user* or *.kick 92300...*' }, { quoted: wasi_msg });
        }

        // 4. Safety Guards
        const botJid = jidNormalizedUser(wasi_sock.user?.id || wasi_sock.authState?.creds?.me?.id);
        const ownerJid = (config.ownerNumber || '').replace(/\D/g, '') + '@s.whatsapp.net';
        const sudoList = (config.sudo || []).map(s => s.toString().replace(/\D/g, '') + '@s.whatsapp.net');

        if (targetJid === botJid) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ I cannot kick myself!' }, { quoted: wasi_msg });
        }
        if (targetJid === ownerJid || sudoList.includes(targetJid)) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ I cannot kick the Bot Owner or Sudo users.' }, { quoted: wasi_msg });
        }

        // 5. Execution
        try {
            const response = await wasi_sock.groupParticipantsUpdate(wasi_chatId, [targetJid], "remove");
            // Baileys returns an array of results with status codes
            const result = response[0];

            if (result.status === "200") {
                await wasi_sock.sendMessage(wasi_chatId, { text: `✅ Successfully removed @${targetJid.split('@')[0]}`, mentions: [targetJid] }, { quoted: wasi_msg });
            } else if (result.status === "403") {
                await wasi_sock.sendMessage(wasi_chatId, { text: `❌ Failed to remove @${targetJid.split('@')[0]}. They might be the group creator or I don't have enough power.`, mentions: [targetJid] }, { quoted: wasi_msg });
            } else {
                await wasi_sock.sendMessage(wasi_chatId, { text: `❌ Error: Received status code ${result.status} from WhatsApp.` }, { quoted: wasi_msg });
            }
        } catch (e) {
            console.error('Kick Command Error:', e);
            await wasi_sock.sendMessage(wasi_chatId, { text: `❌ A technical error occurred while trying to kick the user.` }, { quoted: wasi_msg });
        }
    }
};
