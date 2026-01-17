const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'setgpp',
    aliases: ['gpp', 'icon'],
    category: 'Group',
    desc: 'Update group profile picture. Reply to an image.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_isGroup } = context;

        if (!wasi_isGroup) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ This command can only be used in groups.' });
        }

        // Check if user is admin (simple check, better to check actual admin status)
        // For now, allow anyone or strictly admin? Usually plugins check for admin.
        // Let's implement a quick admin check helper or just proceed for now.

        const quotedMsg = wasi_msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = wasi_msg.message.imageMessage || quotedMsg?.imageMessage;

        if (!imageMsg) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please send or reply to an image.' });
        }

        try {
            const stream = await downloadContentFromMessage(imageMsg, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            await wasi_sock.updateProfilePicture(wasi_sender, buffer);
            await wasi_sock.sendMessage(wasi_sender, { text: '✅ Group Profile Picture Updated!' });

        } catch (e) {
            console.error(e);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to update profile picture. Ensure the bot is Admin.' });
        }
    }
};
