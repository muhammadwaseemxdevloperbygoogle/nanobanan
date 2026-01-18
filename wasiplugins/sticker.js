const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    category: 'Media',
    desc: 'Convert image/video to sticker',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        console.log('🎬 Sticker command triggered!');
        const { wasi_msg, wasi_args } = context;

        // Check for quoted message or direct media
        const quotedMsg = wasi_msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const mediaMsg = wasi_msg.message.imageMessage || wasi_msg.message.videoMessage ||
            quotedMsg?.imageMessage || quotedMsg?.videoMessage;

        if (!mediaMsg) {
            return wasi_sock.sendMessage(wasi_sender, {
                text: '❌ *Reply to an image or video to convert it to a sticker!*\n\nUsage: Reply to an image/video with `.sticker`\nOptional: `.sticker Pack Name | Author`'
            });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: '⏳ Creating sticker...' });

            // Correctly structure the message for download
            let msgToDownload = wasi_msg;
            if (quotedMsg) {
                // Creating a fake message object that mimics a direct media message
                // This is required because downloadMediaMessage expects { message: ... }
                msgToDownload = {
                    message: quotedMsg,
                    key: { ...wasi_msg.key, id: wasi_msg.message.extendedTextMessage.contextInfo.stanzaId, participant: wasi_msg.message.extendedTextMessage.contextInfo.participant }
                };
            }

            // Download media
            const buffer = await downloadMediaMessage(
                msgToDownload,
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: wasi_sock.updateMediaMessage
                }
            );

            // Parse sticker metadata from args (wasi_args is an Array!)
            const fullArgs = wasi_args.join(' ');
            const pack = fullArgs.split('|')[0]?.trim() || 'WASI BOT';
            const author = fullArgs.split('|')[1]?.trim() || '@Itxxwasi';

            // Convert to WebP using sharp for proper sticker format
            const webpBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();

            // Send as sticker with proper format
            await wasi_sock.sendMessage(wasi_sender, {
                sticker: webpBuffer,
                packname: pack,
                author: author
            });

        } catch (error) {
            console.error('Sticker error:', error);
            await wasi_sock.sendMessage(wasi_sender, {
                text: '❌ Failed to create sticker. Make sure you replied to an image or short video.'
            });
        }
    }
};
