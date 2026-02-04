const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
    name: "spam",
    aliases: ["delspam"],
    category: "Group",
    desc: "Delete last 20 messages of a specific user.",
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args, wasi_isAdmin, wasi_botIsAdmin, wasi_isOwner, wasi_store, wasi_isGroup, wasi_text } = context;

        // 1. Permission Check
        if (wasi_isGroup) {
            if (!wasi_isAdmin && !wasi_isOwner) return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '❌ This command is restricted to Admins.' }, { quoted: wasi_msg });
            if (!wasi_botIsAdmin) return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '❌ Bot must be Admin to delete messages.' }, { quoted: wasi_msg });
        } else {
            // In DMs, only Owner can use it to clear things (or maybe anyone for their own bot? Stick to Owner for safety)
            if (!wasi_isOwner) return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '❌ This command is restricted to Owner in DMs.' }, { quoted: wasi_msg });
        }

        // 2. Identify Target User
        let targetJid = null;
        const quotedMsg = wasi_msg.message?.extendedTextMessage?.contextInfo;
        const mentionedJid = wasi_msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (quotedMsg && quotedMsg.participant) {
            targetJid = jidNormalizedUser(quotedMsg.participant);
        } else if (mentionedJid.length > 0) {
            targetJid = jidNormalizedUser(mentionedJid[0]);
        }

        if (!targetJid) {
            return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, {
                text: '❌ Please reply to a user or mention them to delete their spam.\nUsage: .spam @user'
            }, { quoted: wasi_msg });
        }

        if (!wasi_store) {
            return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '❌ Message store is empty or unavailable.' }, { quoted: wasi_msg });
        }

        await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '⏳ Scanning and deleting spam...' }, { quoted: wasi_msg });

        // 3. Filter Messages
        const chatId = wasi_msg.key.remoteJid;
        const messages = [];

        for (const msg of wasi_store.values()) {
            if (msg.key && msg.key.remoteJid === chatId) {
                // Check Participant
                const msgSender = jidNormalizedUser(msg.key.participant || msg.key.remoteJid);
                // Note: msg.key.participant is undefined in DMs usually, remoteJid is the sender

                if (msgSender === targetJid) {
                    messages.push(msg);
                }
            }
        }

        // 4. Sort (Newest First) and Take 20
        // Baileys messages usuall have messageTimestamp
        messages.sort((a, b) => {
            const tA = (a.messageTimestamp?.low || a.messageTimestamp || 0);
            const tB = (b.messageTimestamp?.low || b.messageTimestamp || 0);
            return tB - tA;
        });

        const toDelete = messages.slice(0, 20);

        if (toDelete.length === 0) {
            return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '⚠️ No recent messages found for this user in cache.' }, { quoted: wasi_msg });
        }

        // 5. Delete Loop
        let deletedCount = 0;
        for (const msg of toDelete) {
            try {
                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 500));
                await wasi_sock.sendMessage(chatId, { delete: msg.key });
                deletedCount++;
            } catch (e) {
                console.error('Failed to delete message:', e.message);
            }
        }

        await wasi_sock.sendMessage(chatId, { text: `✅ Successfully deleted ${deletedCount} messages from @${targetJid.split('@')[0]}`, mentions: [targetJid] });
    }
};
