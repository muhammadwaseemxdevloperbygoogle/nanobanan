module.exports = {
    name: 'play',
    aliases: ['song', 'p'],
    category: 'Download',
    desc: 'Search and play audio from YouTube',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_yt_audio, wasi_yt_search } = require('../wasilib/youtube');

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, { text: "🎶 *YouTube Player*\n\nUsage: `.play [song name]`\nExample: `.play dandelions`" }, { quoted: wasi_msg });
        }

        const query = wasi_args.join(' ');

        try {
            await sock.sendMessage(from, { text: `🔍 *Searching:* "${query}"...` }, { quoted: wasi_msg });

            const searchRes = await wasi_yt_search(query);

            if (!searchRes.status || !searchRes.results || searchRes.results.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *No results found.*" }, { quoted: wasi_msg });
            }

            const video = searchRes.results[0];
            await sock.sendMessage(from, {
                text: `🎵 *Playing:* ${video.title}\n⏱️ *Duration:* ${video.duration || 'N/A'}\n_Downloading audio..._`
            }, { quoted: wasi_msg });

            const data = await wasi_yt_audio(video.url);

            if (data.status && data.result) {
                // Send audio with rich context info
                return await sock.sendMessage(from, {
                    audio: { url: data.result },
                    mimetype: 'audio/mpeg',
                    fileName: `${data.title || video.title}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: data.title || video.title,
                            body: data.channel || video.author || 'YouTube Music',
                            showAdAttribution: true,
                            mediaType: 2,
                            sourceUrl: video.url,
                            thumbnailUrl: data.thumbnail || video.thumbnail
                        }
                    }
                }, { quoted: wasi_msg });
            } else {
                return await sock.sendMessage(from, {
                    text: `❌ *Error:* ${data.message || 'Failed to fetch audio. Try a shorter video.'}`
                }, { quoted: wasi_msg });
            }

        } catch (error) {
            console.error('Play Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Server error occurred. Please try again.*" }, { quoted: wasi_msg });
        }
    }
};
