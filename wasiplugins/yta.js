module.exports = {
    name: 'yta',
    aliases: ['ytmp3', 'audio'],
    category: 'Download',
    desc: 'Download audio from YouTube',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_yt_audio, wasi_yt_search } = require('../wasilib/youtube');

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, {
                text: "🔊 *YouTube Audio Downloader*\n\nUsage: `.yta [url or search query]`\nExample: `.yta dandelions`\n\n💡 *Tip:* You can paste a YouTube URL or just type a song name!"
            }, { quoted: wasi_msg });
        }

        let url = wasi_args[0];
        let videoTitle = '';

        try {
            // If it's not a URL, search for it first
            if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
                await sock.sendMessage(from, { text: `🔍 *Searching:* "${wasi_args.join(' ')}"...` }, { quoted: wasi_msg });

                const searchRes = await wasi_yt_search(wasi_args.join(' '));
                if (searchRes.status && searchRes.results && searchRes.results.length > 0) {
                    url = searchRes.results[0].url;
                    videoTitle = searchRes.results[0].title;
                    await sock.sendMessage(from, {
                        text: `🎵 *Found:* ${videoTitle}\n⏱️ *Duration:* ${searchRes.results[0].duration || 'N/A'}\n_Downloading audio..._`
                    }, { quoted: wasi_msg });
                } else {
                    return await sock.sendMessage(from, { text: "❌ *No results found.*" }, { quoted: wasi_msg });
                }
            } else {
                await sock.sendMessage(from, { text: `⏳ *Processing:* Downloading audio from YouTube...` }, { quoted: wasi_msg });
            }

            const data = await wasi_yt_audio(url);

            if (data.status && data.result) {
                // Send thumbnail with info first
                const caption = `*🎵 YOUTUBE AUDIO*\n\n` +
                    `*Title:* ${data.title || videoTitle || 'Unknown'}\n` +
                    `*Quality:* ${data.quality || '128kbps'}\n` +
                    `*Provider:* ${data.channel || 'WASI-DEV-APIS'}\n\n` +
                    `_Uploading audio to WhatsApp..._`;

                if (data.thumbnail) {
                    await sock.sendMessage(from, { image: { url: data.thumbnail }, caption: caption }, { quoted: wasi_msg });
                } else {
                    await sock.sendMessage(from, { text: caption }, { quoted: wasi_msg });
                }

                // Send audio file
                return await sock.sendMessage(from, {
                    audio: { url: data.result },
                    mimetype: 'audio/mpeg',
                    fileName: `${data.title || videoTitle || 'audio'}.mp3`
                }, { quoted: wasi_msg });
            } else {
                return await sock.sendMessage(from, {
                    text: `❌ *Error:* ${data.message || "Failed to download. Video might be too long or restricted."}`
                }, { quoted: wasi_msg });
            }

        } catch (error) {
            console.error('YTA Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Server error occurred. Please try again.*" }, { quoted: wasi_msg });
        }
    }
};
