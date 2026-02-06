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
            await sock.sendMessage(from, { text: `🚀 *Processing:* Searching and preparing downloads for "${query}"...` }, { quoted: wasi_msg });

            const data = await wasi_kitabnagri_search(query);

            if (!data.status || !data.results || data.results.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *No Results Found*\nCheck the spelling or be more specific." }, { quoted: wasi_msg });
            }

            // Filter for high-confidence matches (similarity > 0.4)
            // Limit to top 3 to avoid spam/crashes
            const matches = data.results.filter(r => r.similarity > 0.4).slice(0, 3);

            if (matches.length === 0) {
                // Try top match anyway if similarity is low but it's the only one
                matches.push(data.results[0]);
            }

            for (const target of matches) {
                try {
                    const details = await wasi_kitabnagri_details(target.link);

                    if (!details.status || !details.downloadLink) continue;

                    if (details.downloadLink.includes('mediafire.com')) {
                        const dlData = await wasi_mediafire_dl(details.downloadLink);
                        if (dlData.status && dlData.result.downloadUrl) {
                            await sock.sendMessage(from, { text: `📦 *Found:* ${dlData.result.fileName} (${dlData.result.fileSize})\n\n_Uploading..._` }, { quoted: wasi_msg });

                            await sock.sendMessage(from, {
                                document: { url: dlData.result.downloadUrl },
                                fileName: dlData.result.fileName,
                                mimetype: 'application/pdf',
                                caption: `*📖 Novel:* ${dlData.result.fileName}\n*Size:* ${dlData.result.fileSize}\n\n_Powered by WASI-DEV-APIS_`
                            }, { quoted: wasi_msg });
                            continue;
                        }
                    } else if (details.downloadLink.includes('drive.google.com')) {
                        await sock.sendMessage(from, {
                            text: `📂 *Google Drive:* ${details.title}\n*Link:* ${details.downloadLink}`
                        }, { quoted: wasi_msg });
                        continue;
                    }
                } catch (err) {
                    console.error(`Auto-download failed for ${target.title}:`, err.message);
                }
            }

        } catch (error) {
            console.error('NovelDL Error:', error.message);
            await sock.sendMessage(from, { text: "❌ *Internal Error occurred.*" }, { quoted: wasi_msg });
        }
    }
};
