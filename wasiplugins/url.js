const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { wasi_uploadToCatbox, wasi_uploadToCloudinary } = require('../wasilib/uploader');
const config = require('../wasi');

module.exports = {
    name: 'url',
    aliases: ['tourl', 'imgurl', 'upload'],
    category: 'Media',
    desc: 'Upload image/video and get URL',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg } = context;

        // Check for quoted message or direct media
        const contextInfo = wasi_msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;

        // Media detection (supports image, video, document)
        const isQuoted = !!quotedMsg;
        const msg = isQuoted ? quotedMsg : wasi_msg.message;

        const isImage = msg.imageMessage || msg.viewOnceMessageV2?.message?.imageMessage || msg.viewOnceMessage?.message?.imageMessage;
        const isVideo = msg.videoMessage || msg.viewOnceMessageV2?.message?.videoMessage || msg.viewOnceMessage?.message?.videoMessage;

        if (!isImage && !isVideo) {
            return await sock.sendMessage(from, {
                text: '❌ *Reply to an image or video to upload it!*\n\nUsage: Reply to a media with `.url`'
            }, { quoted: wasi_msg });
        }

        try {
            await sock.sendMessage(from, { text: '⏳ Uploading to server...' }, { quoted: wasi_msg });

            // Download media
            const buffer = await downloadMediaMessage(
                { message: msg },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            // Upload Strategy: Cloudinary (If Configured) -> Catbox
            let imageUrl = null;

            if (config.cloudinaryCloudName) {
                console.log('[URL] Trying Cloudinary...');
                imageUrl = await wasi_uploadToCloudinary(buffer);
            }

            if (!imageUrl) {
                console.log('[URL] Falling back to Catbox...');
                imageUrl = await wasi_uploadToCatbox(buffer);
            }

            if (!imageUrl) {
                throw new Error('All upload services failed');
            }

            await sock.sendMessage(from, {
                text: `✅ *Uploaded Successfully!*\n\n🔗 *URL:*\n${imageUrl}\n\n_Powered by WASI BOT_`
            }, { quoted: wasi_msg });

        } catch (error) {
            console.error('URL command error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to upload media. Catbox might be down or file is too large.'
            }, { quoted: wasi_msg });
        }
    }
};
