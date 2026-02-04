module.exports = {
    name: 'logo',
    category: 'Graphics',
    desc: 'Create various logo styles with your text.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');

        const text = wasi_args.join(' ');
        if (!text) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide text for the logo!\nUsage: .logo <your_text>' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Generating your logo...*` }, { quoted: wasi_msg });

            // Using Maher Zubair's API for logos
            const apiUrl = `https://api.maher-zubair.tech/maker/gaming?text=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status !== 200 || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to generate logo. Try different text.' }, { quoted: wasi_msg });
            }

            await wasi_sock.sendMessage(wasi_sender, {
                image: { url: data.result },
                caption: `🎨 *LOGO GENERATED*\n✨ *Style:* Gaming/3D\n\n> _Powered by WASI-MD-V7_`
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('Logo Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to generate logo.' }, { quoted: wasi_msg });
        }
    }
};
