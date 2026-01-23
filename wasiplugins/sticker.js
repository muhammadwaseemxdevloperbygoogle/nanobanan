const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    category: 'Media',
    desc: 'Convert image/video to sticker',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args, sessionId } = context;

        // Media detection
        const contextInfo = wasi_msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const msg = quotedMsg || wasi_msg.message;

        const isImage = msg?.imageMessage || msg?.viewOnceMessageV2?.message?.imageMessage || msg?.viewOnceMessage?.message?.imageMessage;
        const isVideo = msg?.videoMessage || msg?.viewOnceMessageV2?.message?.videoMessage || msg?.viewOnceMessage?.message?.videoMessage;

        if (!isImage && !isVideo) {
            return await sock.sendMessage(from, {
                text: '❌ *Reply to an image or video to create a sticker!*'
            }, { quoted: wasi_msg });
        }

        try {
            await sock.sendMessage(from, { text: '⏳ Creating sticker...' }, { quoted: wasi_msg });

            const buffer = await downloadMediaMessage(
                { message: msg },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            // Parse metadata
            const fullArgs = wasi_args.join(' ');
            const pack = fullArgs.split('|')[0]?.trim() || 'WASI BOT';
            const author = fullArgs.split('|')[1]?.trim() || '@Itxxwasi';

            let webpBuffer;

            if (isImage) {
                // Handle Image Sticker
                webpBuffer = await sharp(buffer)
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp({ quality: 80 })
                    .toBuffer();
            } else {
                // Handle Video/GIF Sticker (Requires FFmpeg)
                const inputPath = path.join(__dirname, `../temp/input_${sessionId}_${Date.now()}.mp4`);
                const outputPath = path.join(__dirname, `../temp/output_${sessionId}_${Date.now()}.webp`);

                if (!fs.existsSync(path.join(__dirname, '../temp'))) fs.mkdirSync(path.join(__dirname, '../temp'));
                fs.writeFileSync(inputPath, buffer);

                // Convert using FFmpeg
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -i "${inputPath}" -vcodec libwebp -filter_complex "[0:v] scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1,fps=15" -loop 0 -preset default -an -vsync 0 -s 512:512 "${outputPath}"`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                webpBuffer = fs.readFileSync(outputPath);

                // Cleanup
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }

            // Send Sticker
            await sock.sendMessage(from, {
                sticker: webpBuffer,
                packname: pack,
                author: author
            }, { quoted: wasi_msg });

        } catch (error) {
            console.error('Sticker error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to create sticker. Make sure file is not too large or corrupt.'
            }, { quoted: wasi_msg });
        }
    }
};
