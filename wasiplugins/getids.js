module.exports = {
    name: 'getgjids',
    aliases: ['gjid', 'groupjids', 'getcid', 'cid', 'getcids'],
    category: 'Owner',
    desc: 'Fetch all joined groups JIDs and names, or get current chat ID.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_text, wasi_isOwner, wasi_cmd_input } = context;

        // Command Switch
        const cmd = wasi_cmd_input.toLowerCase();

        // 1. GET CURRENT CHAT ID (getcid / cid)
        if (cmd === 'getcid' || cmd === 'cid') {
            return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, {
                text: `🆔 *Current Chat ID:*\n\n\`${wasi_msg.key.remoteJid}\``
            }, { quoted: wasi_msg });
        }

        // 2. GET ALL GROUP JIDS (getgjids / getcids)
        // Restricted to Owner
        if (!wasi_isOwner) {
            return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '❌ This command is restricted to the Owner.' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '⏳ *Fetching All Group JIDs...*' }, { quoted: wasi_msg });

            const groups = await wasi_sock.groupFetchAllParticipating();
            const groupList = Object.values(groups);

            if (groupList.length === 0) {
                return await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: '⚠️ No groups found.' }, { quoted: wasi_msg });
            }

            let text = `📋 *GROUPS LIST (${groupList.length})*\n\n`;
            let jsonList = [];

            groupList.forEach((g, index) => {
                const name = g.subject || 'Unknown Name';
                const id = g.id;
                text += `${index + 1}. *${name}*\n   🆔 \`${id}\`\n\n`;

                jsonList.push({
                    index: index + 1,
                    name: name,
                    jid: id,
                    participants: g.participants?.length || 0
                });
            });

            // If list is small (less than 2000 chars), send as text
            if (text.length < 2000) {
                await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: text }, { quoted: wasi_msg });
            } else {
                // If too long, send as a file
                const buffer = Buffer.from(text, 'utf-8');
                await wasi_sock.sendMessage(wasi_msg.key.remoteJid, {
                    document: buffer,
                    mimetype: 'text/plain',
                    fileName: 'group_jids.txt',
                    caption: `✅ Found ${groupList.length} groups. List attached.`
                }, { quoted: wasi_msg });
            }

        } catch (e) {
            console.error('GetGJIDs Error:', e);
            await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { text: `❌ Error fetching groups: ${e.message}` }, { quoted: wasi_msg });
        }
    }
};
