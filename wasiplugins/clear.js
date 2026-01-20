module.exports = {
    name: 'clear',
    category: 'Chats',
    desc: 'Clear the chat history',
    wasi_handler: async (wasi_sock, wasi_chatId, context) => {
        const { wasi_msg } = context;
        try {
            await wasi_sock.chatModify(
                {
                    clear: true,
                    lastMessages: [{ key: wasi_msg.key, messageTimestamp: wasi_msg.messageTimestamp }],
                },
                wasi_chatId
            );
            await wasi_sock.sendMessage(wasi_chatId, { text: '✅ Chat cleared.' });
        } catch (err) {
            console.error('Clear Chat Error:', err);
            await wasi_sock.sendMessage(wasi_chatId, {
                text: '❌ Failed to clear chat.\n\n*Reason:* App state keys might be missing or out of sync. This often happens on Linked Devices (LID).'
            });
        }
    }
};
