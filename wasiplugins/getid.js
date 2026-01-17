module.exports = {
    name: 'getid',
    aliases: ['id', 'jid'],
    category: 'General',
    desc: 'Get Chat ID, User ID, or Newsletter/Channel ID from quoted message.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg } = context;

        let text = '*🆔 ID INFORMATION*\n\n';

        // 1. Current Chat
        text += `📌 *Chat JID:* ${wasi_sender}\n`;
        // participant is defined in groups, otherwise it's undefined (so use sender)
        const senderJid = wasi_msg.key.participant || wasi_sender;
        text += `👤 *Sender JID:* ${senderJid}\n`;

        // 2. Quoted / Context Info
        // Check for extended text (text reply) or any other message type that has contextInfo (image, video etc often have it too)
        const msgContent = wasi_msg.message?.extendedTextMessage ||
            wasi_msg.message?.imageMessage ||
            wasi_msg.message?.videoMessage ||
            wasi_msg.message?.documentMessage ||
            wasi_msg.message?.audioMessage;

        const quoted = msgContent?.contextInfo;

        if (quoted) {
            const quotedParticipant = quoted.participant || quoted.remoteJid;
            if (quotedParticipant) {
                text += `\n*↪️ Quoted User:*\n`;
                text += `👤 *JID:* ${quotedParticipant}\n`;
            }

            // 3. Newsletter/Channel Info (Specific Request)
            // This is found in forwardedNewsletterMessageInfo
            const newsletterInfo = quoted.forwardedNewsletterMessageInfo;
            if (newsletterInfo) {
                text += `\n*📰 Newsletter / Channel:*\n`;
                text += `🆔 *ID:* \`${newsletterInfo.newsletterJid}\`\n`;
                text += `🏷️ *Name:* ${newsletterInfo.newsletterName}\n`;
                text += `🔢 *Server Message ID:* ${newsletterInfo.serverMessageId}\n`;
            }
        }

        await wasi_sock.sendMessage(wasi_sender, { text: text }, { quoted: wasi_msg });
    }
};
