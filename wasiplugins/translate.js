const axios = require('axios');

module.exports = {
    name: 'translate',
    aliases: ['tr', 'trans'],
    category: 'Utilities',
    desc: 'Translate text to any language',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args, wasi_msg } = context;

        // Get text from args or quoted message
        let textToTranslate = wasi_args;
        const quotedText = wasi_msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
            wasi_msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

        if (quotedText && wasi_args) {
            // If quoted and args, args is the target language
            textToTranslate = quotedText;
        }

        if (!textToTranslate && !quotedText) {
            return wasi_sock.sendMessage(wasi_sender, {
                text: '❌ *Please provide text to translate!*\n\n' +
                    'Usage:\n' +
                    '• `.translate en Hola mundo`\n' +
                    '• `.translate ur Hello` (to Urdu)\n' +
                    '• Reply to message with `.translate es`'
            });
        }

        try {
            // Parse target language
            const parts = (wasi_args || 'en').split(' ');
            let targetLang = 'en';
            let text = textToTranslate;

            if (parts[0].length <= 3) {
                targetLang = parts[0].toLowerCase();
                if (!quotedText) {
                    text = parts.slice(1).join(' ') || textToTranslate;
                }
            }

            if (!text) {
                return wasi_sock.sendMessage(wasi_sender, { text: '❌ No text provided to translate!' });
            }

            // Use Google Translate API
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

            const response = await axios.get(url);
            const translatedText = response.data[0].map(item => item[0]).join('');
            const detectedLang = response.data[2] || 'auto';

            await wasi_sock.sendMessage(wasi_sender, {
                text: `🌐 *Translation*\n\n` +
                    `📝 *Original (${detectedLang}):*\n${text}\n\n` +
                    `✅ *Translated (${targetLang}):*\n${translatedText}`
            });

        } catch (error) {
            console.error('Translate error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Translation failed. Try again.' });
        }
    }
};
