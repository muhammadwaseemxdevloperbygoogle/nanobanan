const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'add',
    category: 'Group',
    desc: 'Add a user to the group',
    wasi_handler: async (wasi_sock, wasi_chatId, context) => {
        const { wasi_msg, wasi_args, wasi_isGroup, wasi_isAdmin, wasi_botIsAdmin, wasi_isOwner, wasi_isSudo } = context;

        if (!wasi_isGroup) return wasi_sock.sendMessage(wasi_chatId, { text: '❌ This command only works in groups.' }, { quoted: wasi_msg });

        // 1. Permission Check
        if (!wasi_isAdmin && !wasi_isSudo) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ Only Group Admins can use this command.' }, { quoted: wasi_msg });
        }

        if (!wasi_botIsAdmin) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ I need to be an Admin to add members.' }, { quoted: wasi_msg });
        }

        // 2. Target Detection
        let targetJid = null;
        if (wasi_msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = jidNormalizedUser(wasi_msg.message.extendedTextMessage.contextInfo.mentionedJid[0]);
        } else if (wasi_args.length > 0) {
            const rawNumber = wasi_args[0].replace(/\D/g, '');
            if (rawNumber.length >= 7) {
                targetJid = jidNormalizedUser(rawNumber + '@s.whatsapp.net');
            }
        }

        if (!targetJid) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❓ Usage: Tag a user or provide their number.\nExample: *.add 92300...*' }, { quoted: wasi_msg });
        }

        // 3. Execution
        try {
            const response = await wasi_sock.groupParticipantsUpdate(wasi_chatId, [targetJid], "add");
            const result = response[0];

            if (result.status === "200") {
                await wasi_sock.sendMessage(wasi_chatId, { text: `✅ Successfully added @${targetJid.split('@')[0]}`, mentions: [targetJid] }, { quoted: wasi_msg });
            } else if (result.status === "403") {
                // User has private privacy settings - Send invite link instead
                await wasi_sock.sendMessage(wasi_chatId, { text: `⚠️ Could not add @${targetJid.split('@')[0]} due to their privacy settings. Sending an invite link to their private chat instead...`, mentions: [targetJid] }, { quoted: wasi_msg });

                // Get invite code
                const code = await wasi_sock.groupInviteCode(wasi_chatId);
                if (code) {
                    await wasi_sock.sendMessage(targetJid, { text: `Hello! You were invited to join this group: https://chat.whatsapp.com/${code}` });
                }
            } else if (result.status === "409") {
                await wasi_sock.sendMessage(wasi_chatId, { text: `❌ @${targetJid.split('@')[0]} is already in this group.`, mentions: [targetJid] }, { quoted: wasi_msg });
            } else if (result.status === "408") {
                await wasi_sock.sendMessage(wasi_chatId, { text: `❌ @${targetJid.split('@')[0]} just left the group recently. Try again later.`, mentions: [targetJid] }, { quoted: wasi_msg });
            } else {
                await wasi_sock.sendMessage(wasi_chatId, { text: `❌ Failed to add user. Status Code: ${result.status}` }, { quoted: wasi_msg });
            }
        } catch (e) {
            console.error('Add Command Error:', e);
            await wasi_sock.sendMessage(wasi_chatId, { text: `❌ A technical error occurred while trying to add the user.` }, { quoted: wasi_msg });
        }
    }
};
