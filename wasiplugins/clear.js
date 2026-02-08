module.exports = {
    name: 'clear',
    category: 'Chats',
    desc: 'Clear the chat history',
    wasi_handler: async (sock, from, context) => {
        const { wasi_msg } = context;
        try {
            await sock.chatModify(
                {
                    clear: true,
                    lastMessages: [{ key: wasi_msg.key, messageTimestamp: wasi_msg.messageTimestamp }],
                },
                from
            );
            await sock.sendMessage(from, { text: '✅ Chat cleared.' }, { quoted: wasi_msg });
        } catch (err) {
            console.error('Clear Chat Error:', err);
            await sock.sendMessage(from, {
                text: `❌ Failed to clear chat.\n\n*Reason:* ${err.message}\n\n_Note: This often happens on Linked Devices (LID) or when app state keys are out of sync._`
            }, { quoted: wasi_msg });
        }
    }
};
