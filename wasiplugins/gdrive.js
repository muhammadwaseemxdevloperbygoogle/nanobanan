module.exports = {
    name: 'gdrive',
    category: 'Downloader',
    desc: 'Download files from Google Drive.',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const axios = require('axios');

        const { wasiApi } = require('../wasilib/wasiapi');

        const url = wasi_args[0];
        if (!url) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide a Google Drive URL!' }, { quoted: wasi_msg });
        }

        try {
            await wasi_sock.sendMessage(wasi_sender, { text: `⏳ *Processing Google Drive link...*` }, { quoted: wasi_msg });

            // PRIMARY: WASI DEV APIs
            const getDriveData = async () => {
                // Strategy 0: WASI DEV APIs
                try {
                    const data = await wasiApi('/api/download/gdrive', { url });
                    if (data && data.status && data.result) {
                        return { status: 200, result: data.result };
                    }
                } catch (e) { console.log('WASI API GDrive Failed'); }

                // Strategy 1: Maher Zubair API (Fallback)
                try {
                    const apiUrl = `https://api.maher-zubair.tech/download/gdrive?url=${encodeURIComponent(url)}`;
                    const response = await axios.get(apiUrl);
                    if (response.data.status === 200 && response.data.result) {
                        return response.data;
                    }
                } catch (e) { console.log('Maher Zubair GDrive Failed'); }

                return null;
            };

            const data = await getDriveData();

            if (!data || !data.result) {
                return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to process the link. Ensure it is a valid public Google Drive link.' }, { quoted: wasi_msg });
            }

            const { downloadUrl, fileName, fileSize, mimetype, fileId } = data.result;

            const name = fileName || 'Google Drive File';
            const size = fileSize || 'Unknown Size';
            const type = mimetype || 'application/octet-stream';

            await wasi_sock.sendMessage(wasi_sender, { text: `✅ *File Found!*\n\n📁 *Name:* ${name}\n⚖️ *Size:* ${size}\n📝 *Type:* ${type}\n\n⏳ *Sending file...*` }, { quoted: wasi_msg });

            await wasi_sock.sendMessage(wasi_sender, {
                document: { url: downloadUrl },
                fileName: name,
                mimetype: type,
                caption: `> _Powered by WASI-MD-V7_`
            }, { quoted: wasi_msg });

        } catch (e) {
            console.error('GDrive Error:', e.message);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to download file from Google Drive.' }, { quoted: wasi_msg });
        }
    }
};
