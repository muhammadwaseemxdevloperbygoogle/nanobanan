const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('../wasilib/ffmpeg');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    category: 'Media',
    desc: 'Convert image/video to sticker',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args, sessionId } = context;

        // Extract metadata from message
        const contextInfo = wasi_msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const isQuoted = !!quotedMsg;

        // Detect correct media container
        let targetMsg = isQuoted ? quotedMsg : wasi_msg.message;

        // Handle ViewOnce wrappers
        if (targetMsg?.viewOnceMessageV2?.message) targetMsg = targetMsg.viewOnceMessageV2.message;
        if (targetMsg?.viewOnceMessage?.message) targetMsg = targetMsg.viewOnceMessage.message;

        const isImage = !!targetMsg?.imageMessage;
        const isVideo = !!targetMsg?.videoMessage;

        if (!isImage && !isVideo) {
            return await sock.sendMessage(from, {
                text: '❌ *Reply to an image or short video to create a sticker!*'
            }, { quoted: wasi_msg });
        }

        try {
            await sock.sendMessage(from, { text: '⏳ Creating sticker...' }, { quoted: wasi_msg });

            console.log(`[Sticker] Downloading media... (Image: ${isImage}, Video: ${isVideo})`);

            // Download media - We MUST pass the container that has the [type]Message key
            // Construct a fake message object for downloadMediaMessage if working with quoted
            const msgToDownload = isQuoted ? { message: targetMsg } : wasi_msg;

            // Clean up the object structure for downloadMediaMessage to avoid errors
            // It expects { message: { ... } }
            const downloadPayload = {
                message: targetMsg.imageMessage ? { imageMessage: targetMsg.imageMessage } :
                    targetMsg.videoMessage ? { videoMessage: targetMsg.videoMessage } : targetMsg
            };

            const buffer = await downloadMediaMessage(
                downloadPayload,
                'buffer',
                {},
                {
                    logger: console,
                    // reuploadRequest: sock.updateMediaMessage // removed to avoid potential issues if not needed
                }
            );

            console.log(`[Sticker] Media downloaded. Size: ${buffer.length}`);

            // Parse sticker metadata
            const fullArgs = wasi_args.join(' ');
            const pack = fullArgs.split('|')[0]?.trim() || 'WASI BOT';
            const author = fullArgs.split('|')[1]?.trim() || '@Itxxwasi';

            let webpBuffer;

            if (isImage) {
                console.log('[Sticker] Processing Image with Sharp...');
                // Image Sticker
                webpBuffer = await sharp(buffer)
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp({ quality: 80 })
                    .toBuffer();
            } else {
                console.log('[Sticker] Processing Video with FFMPEG...');
                // Video Sticker
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                const inputPath = path.join(tempDir, `input_${sessionId}_${Date.now()}.mp4`);
                const outputPath = path.join(tempDir, `output_${sessionId}_${Date.now()}.webp`);

                fs.writeFileSync(inputPath, buffer);

                await new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .outputOptions([
                            "-vcodec libwebp",
                            "-filter_complex [0:v] fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
                            "-loop 0",
                            "-preset default",
                            "-an",
                            "-vsync 0",
                            "-s 512:512"
                        ])
                        .toFormat('webp')
                        .on('error', (e) => {
                            console.error('[Sticker] FFMPEG Error:', e);
                            reject(e);
                        })
                        .on('end', () => {
                            console.log('[Sticker] FFMPEG conversion complete.');
                            resolve();
                        })
                        .save(outputPath);
                });

                if (fs.existsSync(outputPath)) {
                    webpBuffer = fs.readFileSync(outputPath);
                } else {
                    throw new Error('FFMPEG failed to generate output file.');
                }

                // Cleanup
                try {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                } catch (e) { }
            }

            console.log(`[Sticker] Sending sticker (${webpBuffer.length} bytes)...`);

            // Send Sticker
            await sock.sendMessage(from, {
                sticker: webpBuffer,
                packname: pack,
                author: author
            }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Sticker Error:', error);
            await sock.sendMessage(from, {
                text: `❌ Error creating sticker: ${error.message}`
            }, { quoted: wasi_msg });
        }
    }
};
