module.exports = {
    name: 'tgs',
    category: 'Downloader',
    desc: 'Download Telegram stickers.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_get, wasi_getBuffer } = require('../wasilib/fetch');

        const url = wasi_args[0];
        if (!url || !url.includes('t.me/addstickers/')) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a valid Telegram sticker URL!\nExample: .tgs https://t.me/addstickers/Oldboyfinal' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching Telegram stickers...*` }, { quoted: wasi_msg });

            const stickerSetName = url.split('/addstickers/')[1];
            // Using the same bot token as V2 for compatibility
            const botToken = '891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4';
            const stickerSetUrl = `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(stickerSetName)}`;

            const stickerSet = await wasi_get(stickerSetUrl);

            if (!stickerSet || !stickerSet.ok || !stickerSet.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch sticker set. Make sure the link is correct.' }, { quoted: wasi_msg });
            }

            const result = stickerSet.result;
            if (result.is_animated || result.is_video) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '⚠️ Animated or Video stickers are not supported in this version.' }, { quoted: wasi_msg });
            }

            const stickers = result.stickers;
            const total = stickers.length;
            const limit = Math.min(total, 5); // Default to sending first 5 to avoid spam/ban

            await wasi_sock.sendMessage(wasi_sender, { text: `✅ *Found ${total} stickers.*\n📦 *Pack:* ${result.title}\n🚚 *Status:* Sending first ${limit} stickers to avoid spam...` }, { quoted: wasi_msg });

            for (let i = 0; i < limit; i++) {
                const fileId = stickers[i].file_id;
                const fileInfoUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
                const fileInfo = await wasi_get(fileInfoUrl);

                if (fileInfo && fileInfo.ok && fileInfo.result) {
                    const filePath = fileInfo.result.file_path;
                    const finalUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
                    const buffer = await wasi_getBuffer(finalUrl);

                    await wasi_sock.sendMessage(wasi_sender, {
                        sticker: buffer,
                        packname: context.config?.packname || 'WASI-MD-V7',
                        author: context.config?.authorName || 'Itxxwasi'
                    });
                }
            }

        } catch (e) {
            console.error('TGS Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` }, { quoted: wasi_msg });
        }
    }
};
