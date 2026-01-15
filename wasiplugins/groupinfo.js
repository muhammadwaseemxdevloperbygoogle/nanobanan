module.exports = {
    name: 'groupinfo',
    aliases: ['ginfo', 'gp'],
    category: 'Group',
    desc: 'Show group information',
    ownerOnly: false,
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        if (!wasi_sender.endsWith('@g.us')) {
            return wasi_sock.sendMessage(wasi_sender, { text: '❌ This command only works in groups!' });
        }

        try {
            const groupMeta = await wasi_sock.groupMetadata(wasi_sender);

            const admins = groupMeta.participants.filter(p => p.admin).length;
            const members = groupMeta.participants.length;
            const created = new Date(groupMeta.creation * 1000).toLocaleDateString();
            const owner = groupMeta.owner || 'Unknown';

            const infoText = `
╭─────────────────────╮
│  📊 *GROUP INFO*
╰─────────────────────╯

📛 *Name:* ${groupMeta.subject}
📝 *Description:* ${groupMeta.desc || 'No description'}

👥 *Members:* ${members}
👑 *Admins:* ${admins}
🔒 *Restricted:* ${groupMeta.restrict ? 'Yes' : 'No'}
📅 *Created:* ${created}

👤 *Owner:* @${owner.split('@')[0]}
🆔 *JID:* ${wasi_sender}
`.trim();

            await wasi_sock.sendMessage(wasi_sender, {
                text: infoText,
                mentions: [owner]
            });

        } catch (error) {
            console.error('Groupinfo error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to get group info.' });
        }
    }
};
