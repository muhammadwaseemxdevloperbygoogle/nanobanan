module.exports = {
    name: 'mediafire',
    aliases: ['mfdl'],
    category: 'Download',
    desc: 'Download files from MediaFire links',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_mediafire_dl } = require('../wasilib/kitabnagri'); // Helpers are shared here

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, { text: "🔗 *MediaFire Downloader*\n\nUsage: `.mediafire [url]`" }, { quoted: wasi_msg });
        }

        const url = wasi_args[0];
        if (!url.includes('mediafire.com')) {
            return await sock.sendMessage(from, { text: "❌ *Invalid URL:* Please provide a valid MediaFire link." }, { quoted: wasi_msg });
        }

        try {
            await sock.sendMessage(from, { text: `🚀 *Extracting:* Resolving MediaFire download link...` }, { quoted: wasi_msg });

            const dlData = await wasi_mediafire_dl(url);

            if (dlData.status && dlData.result.downloadUrl) {
                const { fileName, fileSize, downloadUrl } = dlData.result;

                await sock.sendMessage(from, { text: `📦 *Found:* ${fileName}\n*Size:* ${fileSize}\n\n_Uploading to WhatsApp..._` }, { quoted: wasi_msg });

                return await sock.sendMessage(from, {
                    document: { url: downloadUrl },
                    fileName: fileName,
                    mimetype: 'application/octet-stream',
                    caption: `*📄 File:* ${fileName}\n*Size:* ${fileSize}\n\n_Powered by WASI-DEV-APIS_`
                }, { quoted: wasi_msg });
            } else {
                return await sock.sendMessage(from, { text: `❌ *Error:* ${dlData.message || "Could not resolve download link. Check if the link is still active."}` }, { quoted: wasi_msg });
            }

        } catch (error) {
            console.error('MediaFire Command Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Internal Error occurred.*" }, { quoted: wasi_msg });
        }
    }
};
