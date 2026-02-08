const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['e', '>'],
    category: 'Admin',
    desc: 'Evaluate JavaScript code',
    ownerOnly: true,
    wasi_handler: async (wasi_sock, wasi_origin, context) => {
        const { wasi_sender, wasi_msg, wasi_args, wasi_text } = context; // Destructure wasi_sender, wasi_msg, wasi_args, wasi_text from context
        try {
            let code = wasi_args.join(' ');
            if (!code) return await wasi_sock.sendMessage(wasi_origin, { text: '❌ Please provide code to evaluate.' }); // Use wasi_origin instead of wasi_chatId

            let evaled = await eval(code);

            if (typeof evaled !== 'string') {
                evaled = util.inspect(evaled);
            }

            await wasi_sock.sendMessage(wasi_origin, { text: evaled }, { quoted: wasi_msg }); // Use wasi_origin instead of wasi_chatId
        } catch (e) {
            await wasi_sock.sendMessage(wasi_origin, { text: `❌ Error: ${e.message}` }, { quoted: wasi_msg }); // Use wasi_origin instead of wasi_chatId
        }
    }
};
