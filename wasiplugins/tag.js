module.exports = {
    name: 'tag',
    category: 'Group',
    desc: 'Tag all members or specific users',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;

        if (!wasi_sender.endsWith('@g.us')) {
            return wasi_sock.sendMessage(wasi_sender, { text: '❌ This command only works in groups!' });
        }

        try {
            const groupMeta = await wasi_sock.groupMetadata(wasi_sender);
            const senderId = wasi_msg.key.participant || wasi_sender;

            // Check if sender is admin
            const senderAdmin = groupMeta.participants.find(p => p.id === senderId)?.admin;
            if (!senderAdmin) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ Only admins can use tag!' });
            }

            // Check for quoted message mentions or explicit mentions
            const mentionedJid = wasi_msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedMsg = wasi_msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedParticipant = wasi_msg.message?.extendedTextMessage?.contextInfo?.participant;

            let textToTag = wasi_args.join(' ');

            // If replying to a message, include that user in mentions if not already mentioned
            if (quotedParticipant && !mentionedJid.includes(quotedParticipant)) {
                mentionedJid.push(quotedParticipant);
            }

            // Case 1: Specific Users Mentioned (or quoted) -> Tag Them
            if (mentionedJid.length > 0) {
                // If text is empty, default to "Tagged!"
                if (!textToTag) textToTag = "Tagged!";

                await wasi_sock.sendMessage(wasi_sender, {
                    text: textToTag,
                    mentions: mentionedJid
                });
            }
            // Case 2: No specific mentions -> Tag All
            else {
                const participants = groupMeta.participants.map(p => p.id);
                // If default tagall logic:
                const message = textToTag || '📢 *Attention *';

                // Hidden Tag (Hidetag) style or Visible Tag?
                // "tag this text to all" usually implies the text is the content, and everyone is tagged.
                // Let's do a "Ghost Tag" (Hidetag) where the text is shown, but mentions are hidden/embedded?
                // OR explicit list like tagall?
                // The user said "tag this text to all". 
                // If I use the tagall.js style, it appends list of names.
                // If I use hidetag style, it just sends text with hidden mentions.
                // Given "tag this text", hidetag is often preferred for cleaner chat.
                // But let's stick to the user's likely intent which might just be a smart wrapper.
                // Let's implement Hidetag style for "tag text" as it's cleaner for "tag this text". 
                // If they wanted a list, they usually use .tagall

                await wasi_sock.sendMessage(wasi_sender, {
                    text: message,
                    mentions: participants
                });
            }

        } catch (error) {
            console.error('Tag error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to tag.' });
        }
    }
};
