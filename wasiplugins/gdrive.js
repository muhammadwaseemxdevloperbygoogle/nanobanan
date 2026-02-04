module.exports = {
    name: 'gdrive',
    category: 'Downloader',
    desc: 'Download files from Google Drive.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');

        const url = wasi_args[0];
        if (!url) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a Google Drive URL!' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Processing Google Drive link...*` }, { quoted: wasi_msg });

            const apiUrl = `https://api.maher-zubair.tech/download/gdrive?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status !== 200 || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to process the link. Ensure it is a valid public Google Drive link.' }, { quoted: wasi_msg });
            }

            const { downloadUrl, fileName, fileSize, mimetype } = data.result;

            await wasi_sock.sendMessage(wasi_sender, { text: `✅ *File Found!*\n\n📁 *Name:* ${fileName}\n⚖️ *Size:* ${fileSize}\n📝 *Type:* ${mimetype}\n\n⏳ *Sending file...*` }, { quoted: wasi_msg });

            await wasi_sock.sendMessage(wasi_sender, {
                document: { url: downloadUrl },
                fileName: fileName,
                mimetype: mimetype,
                caption: `> _Powered by WASI-MD-V7_`
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('GDrive Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to download file from Google Drive.' }, { quoted: wasi_msg });
        }
    }
};
