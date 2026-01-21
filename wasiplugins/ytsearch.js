const ytSearch = require('yt-search');

module.exports = {
    name: 'ytsearch',
    aliases: ['yts'],
    category: 'Media',
    desc: 'Search for videos on YouTube',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const query = wasi_args.join(' ');

        if (!query) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a search query.' });

        try {
            const results = await ytSearch(query);
            const videos = results.videos.slice(0, 10);

            if (!videos.length) return await wasi_sock.sendMessage(wasi_sender, { text: '❌ No results found.' });

            let message = `🔎 *YOUTUBE SEARCH RESULTS*\n\n`;
            videos.forEach((video, i) => {
                message += `${i + 1}. *${video.title}*\n`;
                message += `   ⌚ *Duration:* ${video.timestamp}\n`;
                message += `   🔗 *URL:* ${video.url}\n\n`;
            });

            message += `> WASI-MD-V7`;

            await wasi_sock.sendMessage(wasi_sender, {
                image: { url: videos[0].thumbnail },
                caption: message
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('[YTS] Error:', e);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
