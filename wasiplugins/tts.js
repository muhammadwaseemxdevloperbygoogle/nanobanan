const axios = require('axios');

module.exports = {
    name: 'tts',
    aliases: ['speak', 'say'],
    category: 'Utilities',
    desc: 'Convert text to speech',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;

        if (!wasi_args) {
            return wasi_sock.sendMessage(wasi_sender, {
                text: '❌ *Please provide text to convert!*\n\nUsage: `.tts Hello World`\nOptional: `.tts en Hello World` (specify language)'
            });
        }

        try {
            // Parse language code if provided
            const parts = wasi_args.split(' ');
            let lang = 'en';
            let text = wasi_args;

            // Check if first word is a language code (2 letters)
            if (parts[0].length === 2 && parts.length > 1) {
                lang = parts[0].toLowerCase();
                text = parts.slice(1).join(' ');
            }

            await wasi_sock.sendMessage(wasi_sender, { text: '🎙️ Generating audio...' });

            // Use Google TTS API
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            await wasi_sock.sendMessage(wasi_sender, {
                audio: Buffer.from(response.data),
                mimetype: 'audio/mpeg',
                ptt: true // Send as voice note
            });

        } catch (error) {
            console.error('TTS error:', error);
            await wasi_sock.sendMessage(wasi_sender, {
                text: '❌ Failed to generate speech. Try a shorter text.'
            });
        }
    }
};
