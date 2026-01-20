const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['e', '>'],
    category: 'Admin',
    desc: 'Evaluate JavaScript code',
    ownerOnly: true,
    wasi_handler: async (wasi_sock, wasi_chatId, { wasi_msg, wasi_args, wasi_text }) => {
        try {
            let code = wasi_args.join(' ');
            if (!code) return await wasi_sock.sendMessage(wasi_chatId, { text: '❌ Please provide code to evaluate.' });

            let evaled = await eval(code);

            if (typeof evaled !== 'string') {
                evaled = util.inspect(evaled);
            }

            await wasi_sock.sendMessage(wasi_sender, { text: evaled });
        } catch (e) {
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
