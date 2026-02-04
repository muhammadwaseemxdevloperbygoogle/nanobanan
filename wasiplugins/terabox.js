module.exports = {
    name: 'terabox',
    category: 'Downloader',
    desc: 'Download files from Terabox.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasiApi } = require('../wasilib/wasiapi');

        const url = wasi_args[0];
        if (!url) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a Terabox URL!' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Fetching Terabox file...*` }, { quoted: wasi_msg });

            const data = await wasiApi('/api/download/terabox', { url });

            if (!data || !data.status || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to fetch Terabox file. The link might be expired or invalid.' }, { quoted: wasi_msg });
            }

            const { downloadUrl, fileName, size, fastDownload } = data.result;

            const name = fileName || 'Terabox File';
            const sizeStr = size ? `\n⚖️ *Size:* ${size}` : '';

            await wasi_sock.sendMessage(wasi_sender, { text: `✅ *File Found!*\n\n📁 *Name:* ${name}${sizeStr}\n\n⏳ *Sending file...*` }, { quoted: wasi_msg });

            // Try fast download link first, then standard
            const dl = fastDownload || downloadUrl;

            await wasi_sock.sendMessage(wasi_sender, {
                document: { url: dl },
                fileName: name,
                mimetype: 'application/octet-stream',
                caption: `> _Powered by WASI-MD-V7_`
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('Terabox Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to download file from Terabox.' }, { quoted: wasi_msg });
        }
    }
};
