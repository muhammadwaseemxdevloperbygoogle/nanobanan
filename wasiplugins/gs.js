const moment = require('moment-timezone');

module.exports = {
    name: 'gs',
    aliases: ['groupstatus', 'ginfo'],
    category: 'Group',
    desc: 'Get group information/status.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_isGroup } = context;

        if (!wasi_isGroup) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ This command can only be used in groups.' });
        }

        try {
            const metadata = await wasi_sock.groupMetadata(wasi_sender);
            const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
            const owner = metadata.owner || admins.find(p => p.admin === 'superadmin');

            let text = `*📊 GROUP STATUS 📊*\n\n`;
            text += `🏷️ *Subject:* ${metadata.subject}\n`;
            text += `🆔 *ID:* ${metadata.id}\n`;
            text += `👥 *Members:* ${metadata.participants.length}\n`;
            text += `👮 *Admins:* ${admins.length}\n`;
            text += `👑 *Owner:* @${owner ? owner.split('@')[0] : 'Unknown'}\n`;
            text += `📝 *Description:* ${metadata.desc || 'No description'}\n\n`;

            // Settings
            text += `🔒 *Restricted (Edit Info):* ${metadata.restrict ? 'Yes' : 'No'}\n`;
            text += `📢 *Announce (Send Msg):* ${metadata.announce ? 'Yes' : 'No'}\n`;

            await wasi_sock.sendMessage(wasi_sender, {
                text: text,
                mentions: [owner]
            });

        } catch (e) {
            console.error(e);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch group metadata.' });
        }
    }
};
