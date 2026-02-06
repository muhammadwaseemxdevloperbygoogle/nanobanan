module.exports = {
    name: 'ytsearch',
    aliases: ['yts'],
    category: 'Media',
    desc: 'Search for videos on YouTube',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_yt_search } = require('../wasilib/youtube');

        const query = wasi_args.join(' ');

        if (!query) return await wasi_sock.sendMessage(wasi_sender, {
            text: '🔎 *YouTube Search*\n\nUsage: `.ytsearch [query]`\nExample: `.ytsearch never gonna give you up`'
        });

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `🔍 *Searching:* "${query}"...` }, { quoted: wasi_msg });

            const results = await wasi_yt_search(query);

            if (!results.status || !results.results || !results.results.length) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ No results found.' });
            }

            const videos = results.results.slice(0, 10);

            let message = `🔎 *YOUTUBE SEARCH RESULTS*\n\n`;
            videos.forEach((video, i) => {
                message += `*${i + 1}. ${video.title}*\n`;
                message += `   ⏱️ *Duration:* ${video.duration || 'N/A'}\n`;
                message += `   👁️ *Views:* ${video.views || 'N/A'}\n`;
                message += `   🔗 *URL:* ${video.url}\n\n`;
            });

            message += `\`\`\`To download, use:\n.yta [url] - for audio\n.ytv [url] - for video\`\`\`\n\n> WASI-MD-V7`;

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
