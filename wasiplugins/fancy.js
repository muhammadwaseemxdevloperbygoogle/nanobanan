const { fonts } = require('../wasilib/fonts');

module.exports = {
    name: 'fancy',
    aliases: ['font', 'style'],
    category: 'Tools',
    desc: 'Convert text to fancy styles',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg, wasi_args } = context;
        const fontKeys = Object.keys(fonts);

        if (!wasi_args[0]) {
            let list = `✨ *FANCY TEXT STYLES* ✨\n\n`;
            list += `Usage: \`.fancy <number> <text>\`\n\n`;

            fontKeys.forEach((key, index) => {
                const sampleText = "WASI";
                const styled = fonts[key](sampleText);
                list += `*${index + 1}.* ${styled} (style: ${key})\n`;
            });

            return await sock.sendMessage(from, { text: list }, { quoted: wasi_msg });
        }

        const indexInput = parseInt(wasi_args[0]);
        if (isNaN(indexInput)) {
            // If first arg is not a number, maybe use index 1 as default and join all args
            const text = wasi_args.join(' ');
            const styled = fonts.bold(text);
            return await sock.sendMessage(from, { text: styled }, { quoted: wasi_msg });
        }

        const text = wasi_args.slice(1).join(' ');
        if (!text) return await sock.sendMessage(from, { text: '❌ Please provide text after the number.' }, { quoted: wasi_msg });

        const selectedStyle = fontKeys[indexInput - 1];
        if (!selectedStyle) return await sock.sendMessage(from, { text: `❌ Invalid style number. Choose 1 to ${fontKeys.length}` }, { quoted: wasi_msg });

        const styledResult = fonts[selectedStyle](text);
        await sock.sendMessage(from, { text: styledResult }, { quoted: wasi_msg });
    }
};
