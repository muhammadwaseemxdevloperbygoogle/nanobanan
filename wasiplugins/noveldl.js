module.exports = {
    name: 'noveldl',
    aliases: ['bookdl'],
    category: 'Search',
    desc: 'Auto-download and send novel PDF to chat',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const { wasi_kitabnagri_search, wasi_kitabnagri_details, wasi_mediafire_dl } = require('../wasilib/kitabnagri');

        if (!wasi_args[0]) {
            return await sock.sendMessage(from, { text: "📖 *Novel Auto-Downloader*\n\nUsage: `.noveldl [title/author]`\nExample: `.noveldl peer kamil`" }, { quoted: wasi_msg });
        }

        const query = wasi_args.join(' ');

        try {
            await sock.sendMessage(from, { text: `🚀 *Processing:* Searching and preparing download for "${query}"...` }, { quoted: wasi_msg });

            const data = await wasi_kitabnagri_search(query);

            if (!data.status || !data.results || data.results.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *No Results Found*\nCheck the spelling or be more specific." }, { quoted: wasi_msg });
            }

            // Process top 1 match for auto-download
            const target = data.results[0];
            const details = await wasi_kitabnagri_details(target.link);

            if (!details.status || !details.downloadLink) {
                return await sock.sendMessage(from, { text: `❌ *Failed:* Could not extract download link for "${target.title}".` }, { quoted: wasi_msg });
            }

            // Only MediaFire links supported for direct automated extraction here
            if (details.downloadLink.includes('mediafire.com')) {
                const dlData = await wasi_mediafire_dl(details.downloadLink);
                if (dlData.status && dlData.result.downloadUrl) {
                    await sock.sendMessage(from, { text: `📦 *Found:* ${dlData.result.fileName} (${dlData.result.fileSize})\n\n_Uploading to WhatsApp..._` }, { quoted: wasi_msg });

                    return await sock.sendMessage(from, {
                        document: { url: dlData.result.downloadUrl },
                        fileName: dlData.result.fileName,
                        mimetype: 'application/pdf',
                        caption: `*📖 Novel:* ${dlData.result.fileName}\n*Size:* ${dlData.result.fileSize}\n\n_Powered by WASI-DEV-APIS_`
                    }, { quoted: wasi_msg });
                }
            } else if (details.downloadLink.includes('drive.google.com')) {
                // Return link since GDrive direct downloads can be blocked or requires specific handling
                return await sock.sendMessage(from, {
                    text: `📂 *Google Drive Link Found*\n\n*Title:* ${details.title}\n*Link:* ${details.downloadLink}\n\n_Automated upload for GDrive is currently restricted._`
                }, { quoted: wasi_msg });
            }

            await sock.sendMessage(from, { text: `❌ *Error:* Unsupported download source for this book.` }, { quoted: wasi_msg });

        } catch (error) {
            console.error('NovelDL Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Internal Error occurred.*" }, { quoted: wasi_msg });
        }
    }
};
