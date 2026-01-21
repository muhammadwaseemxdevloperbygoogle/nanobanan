module.exports = {
    name: 'tagall',
    aliases: ['everyone', 'all'],
    category: 'Group',
    desc: 'Tag all members in the group',
    wasi_handler: async (wasi_sock, wasi_chatId, context) => {
        const { wasi_msg, wasi_args, wasi_isGroup, wasi_isAdmin, wasi_isOwner, wasi_isSudo, wasi_groupMetadata } = context;

        if (!wasi_isGroup) return wasi_sock.sendMessage(wasi_chatId, { text: '❌ This command only works in groups.' }, { quoted: wasi_msg });

        if (!wasi_isAdmin && !wasi_isSudo) {
            return wasi_sock.sendMessage(wasi_chatId, { text: '❌ Only Group Admins can use this command.' }, { quoted: wasi_msg });
        }

        try {
            const metadata = wasi_groupMetadata || await wasi_sock.groupMetadata(wasi_chatId);
            const participants = metadata.participants;
            const customMessage = wasi_args.join(' ') || 'No Message';

            let tagMessage = `┏━━━┓ *TAG ALL* ┏━━━┓\n\n`;
            tagMessage += `📢 *Message:* ${customMessage}\n`;
            tagMessage += `👥 *Total:* ${participants.length}\n\n`;

            const mentions = [];
            participants.forEach((mem, i) => {
                tagMessage += `┃ ➡️ @${mem.id.split('@')[0]}\n`;
                mentions.push(mem.id);
            });

            tagMessage += `\n┗━━━━━━━━━━━━━━━┛`;

            await wasi_sock.sendMessage(wasi_chatId, { text: tagMessage, mentions }, { quoted: wasi_msg });
        } catch (e) {
            console.error('TagAll Error:', e);
            await wasi_sock.sendMessage(wasi_chatId, { text: '❌ Failed to tag all members.' }, { quoted: wasi_msg });
        }
    }
};
