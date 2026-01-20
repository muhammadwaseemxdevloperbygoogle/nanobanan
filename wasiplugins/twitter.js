const { wasi_twitter } = require('../wasilib/scrapers');

module.exports = {
    name: 'twitter',
    aliases: ['tw', 'twdl', 'x'],
    category: 'Downloader',
    desc: 'Download Twitter (X) Videos',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;
        let url = wasi_args[0];

        if (!url) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a Twitter/X URL.' });

        await wasi_sock.sendMessage(wasi_sender, { text: '⏳ *Fetching Twitter media...*' });

        try {
            const data = await wasi_twitter(url);
            if (!data.status) return await wasi_sock.sendMessage(wasi_sender, { text: `❌ ${data.message}` });

            // Sort by quality and get the best one
            const bestMedia = data.media.sort((a, b) => b.quality - a.quality)[0];

            await wasi_sock.sendMessage(wasi_sender, {
                video: { url: bestMedia.url },
                caption: `🐦 *TWITTER (X) DOWNLOADER*\n\n✨ *Quality:* ${bestMedia.quality}p\n\n> WASI-MD-V7`
            });
        } catch (e) {
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
